import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getTenantAdminDetail,
  setTenantAccessCode,
  updateTenantOwnerCredentials,
  updateTenantDetails,
  updateTenantStatus,
} from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  ArrowLeft, Loader2, Palette, KeyRound, ShieldCheck, Power, PowerOff,
  Eye, EyeOff, ExternalLink, Save, Copy,
} from "lucide-react";

export const Route = createFileRoute("/admin/tenants/$tenantId")({
  ssr: false,
  component: TenantEditor,
});

type Section = "brand" | "owner" | "access" | "status";

const sections: { id: Section; label: string; hint: string; icon: any }[] = [
  { id: "brand", label: "Brand", hint: "Name, logo, colours", icon: Palette },
  { id: "owner", label: "Owner Login", hint: "Email & password", icon: KeyRound },
  { id: "access", label: "Access Code", hint: "Customer join code", icon: ShieldCheck },
  { id: "status", label: "Status", hint: "Suspend or activate", icon: Power },
];

function TenantEditor() {
  const { tenantId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const getDetail = useServerFn(getTenantAdminDetail);
  const setAccessCode = useServerFn(setTenantAccessCode);
  const setOwnerCreds = useServerFn(updateTenantOwnerCredentials);
  const setDetails = useServerFn(updateTenantDetails);
  const setStatus = useServerFn(updateTenantStatus);

  const [section, setSection] = useState<Section>("brand");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-tenant", tenantId],
    queryFn: () => getDetail({ data: { tenantId } }),
    staleTime: 1000 * 60 * 5,
  });

  const [brand, setBrand] = useState({ name: "", tagline: "", primary_color: "#16a34a", whatsapp: "" });
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setBrand({
      name: data.tenant.name ?? "",
      tagline: (data.tenant as any).tagline ?? "",
      primary_color: (data.tenant as any).primary_color ?? "#16a34a",
      whatsapp: (data.tenant as any).whatsapp ?? "",
    });
    setOwnerEmail(data.ownerEmail ?? "");
    setCode(data.accessCode ?? "");
  }, [data]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-tenant", tenantId] });
    queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
  };

  if (isLoading || !data) {
    return (
      <div className="py-32 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
      </div>
    );
  }

  const tenant = data.tenant as any;

  const saveBrand = async () => {
    setSaving("brand");
    try {
      await setDetails({
        data: {
          id: tenantId,
          name: brand.name.trim(),
          tagline: brand.tagline,
          primary_color: brand.primary_color,
          whatsapp: brand.whatsapp,
        },
      });
      toast.success("Brand details saved");
      refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Could not save brand details");
    } finally {
      setSaving(null);
    }
  };

  const saveOwner = async () => {
    if (ownerPassword && ownerPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (ownerPassword && ownerPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSaving("owner");
    try {
      await setOwnerCreds({
        data: {
          tenantId,
          email: ownerEmail && ownerEmail !== data.ownerEmail ? ownerEmail.trim() : undefined,
          password: ownerPassword || undefined,
        },
      });
      toast.success("Owner login updated — they can sign in with these credentials now");
      setOwnerPassword("");
      setConfirmPassword("");
      refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Could not update owner login");
    } finally {
      setSaving(null);
    }
  };

  const saveCode = async () => {
    setSaving("access");
    try {
      await setAccessCode({ data: { tenantId, accessCode: code.trim() } });
      toast.success("Access code saved");
      refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Use 4–24 letters, numbers or dashes");
    } finally {
      setSaving(null);
    }
  };

  const toggleStatus = async () => {
    setSaving("status");
    try {
      await setStatus({ data: { id: tenantId, status: tenant.status === "active" ? "suspended" : "active" } });
      toast.success(tenant.status === "active" ? "Platform suspended" : "Platform activated");
      refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Could not update status");
    } finally {
      setSaving(null);
    }
  };

  const labelCls = "text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1";
  const inputCls = "h-11 rounded-xl bg-slate-50 border-slate-200";
  const cardCls = "bg-white border border-slate-200 rounded-[2rem] p-8 space-y-6 shadow-sm";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Button
            variant="ghost"
            className="h-9 px-3 -ml-3 rounded-xl text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest"
            onClick={() => navigate({ to: "/admin/tenants" })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> All tenants
          </Button>
          <div>
            <h1 className="text-5xl font-bold tracking-tight text-ink leading-none">{tenant.name}</h1>
            <p className="text-slate-500 mt-4 font-medium text-lg">
              <code className="text-slate-400">/p/{tenant.slug}</code> · full tenant configuration
            </p>
          </div>
        </div>
        <Button asChild variant="outline" className="rounded-xl h-12 px-6 font-bold border-slate-200">
          <Link to="/p/$tenantSlug/today" params={{ tenantSlug: tenant.slug }}>
            <ExternalLink className="h-4 w-4 mr-2" /> View portal
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-8 items-start">
        <nav className="bg-white border border-slate-200 rounded-[2rem] p-3 space-y-1 lg:sticky lg:top-24">
          {sections.map((s) => {
            const active = section === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                className={`w-full text-left px-4 py-3 rounded-2xl transition-colors flex items-start gap-3 ${
                  active ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <s.icon className={`h-4 w-4 mt-0.5 ${active ? "text-white" : "text-slate-400"}`} />
                <span className="flex flex-col">
                  <span className="font-bold tracking-tight text-sm">{s.label}</span>
                  <span className={`text-[10px] font-semibold ${active ? "text-slate-300" : "text-slate-400"}`}>{s.hint}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="space-y-6">
          {section === "brand" && (
            <div className={cardCls}>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-ink">Brand</h2>
                <p className="text-slate-500 font-medium mt-1">How this tenant appears to their customers.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className={labelCls}>Brand / Website Name</label>
                  <Input value={brand.name} maxLength={60} onChange={(e) => setBrand({ ...brand, name: e.target.value })} className={inputCls} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>WhatsApp</label>
                  <Input value={brand.whatsapp} maxLength={20} placeholder="+9198XXXXXXXX" onChange={(e) => setBrand({ ...brand, whatsapp: e.target.value })} className={inputCls} />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className={labelCls}>Tagline</label>
                  <Input value={brand.tagline} maxLength={120} onChange={(e) => setBrand({ ...brand, tagline: e.target.value })} className={inputCls} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Primary Colour</label>
                  <div className="flex gap-3">
                    <Input type="color" value={brand.primary_color} onChange={(e) => setBrand({ ...brand, primary_color: e.target.value })} className="w-12 h-11 p-1 rounded-xl bg-slate-50 border-slate-200" />
                    <Input value={brand.primary_color} onChange={(e) => setBrand({ ...brand, primary_color: e.target.value })} className={`flex-1 ${inputCls}`} />
                  </div>
                </div>
              </div>
              <Button onClick={saveBrand} disabled={saving === "brand"} className="h-12 px-8 bg-ink text-white hover:bg-slate-800 font-bold rounded-xl">
                {saving === "brand" ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-2" /> Save brand</>}
              </Button>
            </div>
          )}

          {section === "owner" && (
            <div className={cardCls}>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-ink">Owner Login</h2>
                <p className="text-slate-500 font-medium mt-1">
                  Set the email and password the owner uses to sign in. No access code is required for owners.
                </p>
              </div>
              <div className="space-y-6 max-w-md">
                <div className="space-y-1.5">
                  <label className={labelCls}>Owner Email (sign-in ID)</label>
                  <Input type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value.trim())} className={inputCls} placeholder="owner@example.com" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>New Password</label>
                  <div className="flex gap-2">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={ownerPassword}
                      onChange={(e) => setOwnerPassword(e.target.value)}
                      className={inputCls}
                      placeholder="Type a password (leave blank to keep current)"
                      autoComplete="new-password"
                    />
                    <Button type="button" variant="outline" onClick={() => setShowPassword((v) => !v)} className="rounded-xl px-3 border-slate-200">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Confirm Password</label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputCls}
                    placeholder="Re-type the password"
                    autoComplete="new-password"
                  />
                </div>
              </div>
              {!data.hasOwnerAccount && (
                <p className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                  No owner account is linked to this tenant yet.
                </p>
              )}
              <Button onClick={saveOwner} disabled={saving === "owner"} className="h-12 px-8 bg-ink text-white hover:bg-slate-800 font-bold rounded-xl">
                {saving === "owner" ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-2" /> Update login</>}
              </Button>
            </div>
          )}

          {section === "access" && (
            <div className={cardCls}>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-ink">Customer Access Code</h2>
                <p className="text-slate-500 font-medium mt-1">
                  Customers enter this code on the join page. Type any code you want — nothing is auto-generated.
                </p>
              </div>
              <div className="space-y-1.5 max-w-md">
                <label className={labelCls}>Access Code</label>
                <div className="flex gap-2">
                  <Input
                    value={code}
                    maxLength={24}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""))}
                    className={`${inputCls} font-bold tracking-widest`}
                    placeholder="FAT2FIT2026"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl px-3 border-slate-200"
                    onClick={() => { navigator.clipboard.writeText(code); toast.success("Code copied"); }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-[10px] font-bold text-slate-400 ml-1 pt-1">4–24 letters, numbers or dashes.</p>
              </div>
              <Button onClick={saveCode} disabled={saving === "access" || code.trim().length < 4} className="h-12 px-8 bg-ink text-white hover:bg-slate-800 font-bold rounded-xl">
                {saving === "access" ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-2" /> Save code</>}
              </Button>
            </div>
          )}

          {section === "status" && (
            <div className={cardCls}>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-ink">Platform Status</h2>
                <p className="text-slate-500 font-medium mt-1">
                  Currently {tenant.status === "active" ? "operational" : "suspended"}.
                </p>
              </div>
              <Button
                onClick={toggleStatus}
                disabled={saving === "status"}
                className={`h-12 px-8 font-bold rounded-xl ${
                  tenant.status === "active"
                    ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {saving === "status" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : tenant.status === "active" ? (
                  <><PowerOff className="h-4 w-4 mr-2" /> Suspend platform</>
                ) : (
                  <><Power className="h-4 w-4 mr-2" /> Activate platform</>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
