import { supabaseAdmin } from "@/integrations/supabase/client.server";

const articles = [
  {
    title: "The Indian Protein Gap",
    content: "Most Indian diets are heavily carb-dominant. A typical day of two aloo parathas with chai, followed by aloo-matar and roti, evening street food, and sabzi at night results in almost zero high-quality protein. To fix this, prioritize paneer, dal, chicken, eggs, tofu, and curd. Aim for 1.2g to 1.5g of protein per kg of body weight.",
    type: "PROTEIN",
    category: "NUTRITION",
    tags: ["Indian Diet", "Protein", "Metabolic Health"],
    status: "APPROVED"
  },
  {
    title: "Why Indians hit metabolic problems at a lower BMI",
    content: "Scientific research shows that individuals of Asian-Pacific descent often experience metabolic health issues (like high blood pressure or insulin resistance) at a significantly lower BMI than Western populations. This is why we use the 23.0 cutoff for 'Overweight' rather than the standard 25.0.",
    type: "NUTRITION",
    category: "RESEARCH",
    tags: ["Asian-Pacific", "BMI", "Metabolic Health"],
    status: "APPROVED"
  },
  {
    title: "Calories Simply",
    content: "Energy balance is fundamental. A rough maintenance figure is your bodyweight in kg multiplied by 24. For sustainable weight loss, aim for a 200-300 calorie deficit. This is an estimate, not a strict prescription; listen to your body's hunger and energy signals.",
    type: "NUTRITION",
    category: "GENERAL",
    tags: ["Calories", "Weight Loss", "Energy"],
    status: "APPROVED"
  },
  {
    title: "Carbs and fats are not villains",
    content: "Carbs and fats are essential energy sources. Focus on the quality: complex carbs (whole grains) over simple sugars to avoid the spike-and-crash pattern, and prioritize healthy fats from nuts, seeds, and oils like olive or avocado over processed trans fats.",
    type: "NUTRITION",
    category: "GENERAL",
    tags: ["Carbs", "Fats", "Macronutrients"],
    status: "APPROVED"
  },
  {
    title: "The Five Pillars",
    content: "Optimal health rests on five pillars: Nutrition (fuel quality), Sleep (restoration), Training (functional movement), Recovery (managing stress), and Consistency (daily habits). Neglecting even one pillar can stall your metabolic progress.",
    type: "PROGRAM",
    category: "GENERAL",
    tags: ["Pillars", "Methodology", "Lifestyle"],
    status: "APPROVED"
  }
];

export async function seedKnowledge() {
  const { data, error } = await supabaseAdmin
    .from("knowledge_base")
    .upsert(articles, { onConflict: 'title' });
    
  if (error) console.error("Knowledge seeding error:", error);
  return { data, error };
}
