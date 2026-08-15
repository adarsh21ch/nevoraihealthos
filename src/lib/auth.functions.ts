import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fboId: z.string().min(1),
  accessCode: z.string().min(1),
});

/**
 * Creates a new customer account using only standard client auth.
 * Uses SECURITY DEFINER RPCs on the database to handle protected logic.
 */
export const createCustomerAccount = createServerFn({ method: "POST" })
  .inputValidator((data) => signupSchema.parse(data))
  .handler(async ({ data }) => {
    // 1. Validate the registration code first (optional check before signup)
    const { data: isValid, error: rpcError } = await supabase.rpc(
      "validate_registration_code",
      { _code: data.accessCode }
    );

    if (rpcError || !isValid) {
      throw new Error("Invalid registration code. Please contact your coach.");
    }

    // 2. Sign up the user (standard auth)
    const { data: authData, error: signupError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (signupError) throw signupError;
    if (!authData.user) throw new Error("User creation failed");

    // 3. Establish a session so we can call the completion RPC
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (signInError) {
      console.error("Sign-in after sign-up failed:", signInError.message);
    }

    // 4. Complete the registration (creates customer row and assigns role)
    const { data: customerId, error: completeError } = await supabase.rpc(
      "complete_registration",
      { 
        _code: data.accessCode, 
        _fbo_id: data.fboId 
      }
    );

    if (completeError) {
      console.error("Complete registration error:", completeError);
      throw new Error(`Failed to complete profile: ${completeError.message}`);
    }

    return { customerId, userId: authData.user.id };
  });

/**
 * Resolves a login identifier (email or FBO ID) to a user's email.
 */
export const resolveLoginIdentifier = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ identifier: z.string() }).parse(data))
  .handler(async ({ data }) => {
    if (!supabaseAdmin) {
      if (data.identifier.includes("@")) return data.identifier;
      throw new Error("Login via FBO ID requires server configuration. Please use your email.");
    }

    const { data: customer } = await supabase
      .from("customers")
      .select("user_id")
      .eq("fbo_id", data.identifier)
      .single();

    if (customer?.user_id) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(customer.user_id);
      if (userData.user?.email) return userData.user.email;
    }

    return data.identifier;
  });

/**
 * Resets a customer's password.
 */
export const adminResetCustomerPassword = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ userId: z.string(), newPassword: z.string() }).parse(data))
  .handler(async ({ data }) => {
    if (!supabaseAdmin) {
      throw new Error("Password reset requires server configuration. Please use the 'Forgot Password' link.");
    }
    
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      password: data.newPassword,
    });

    if (error) throw error;
    return { success: true };
  });
