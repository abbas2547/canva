import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 1. Validation Check: Stop the app if variables are missing
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase Environment Variables! Check your .env.local file.");
}

// 2. Initialize Client
export const supabase = createClient(
  supabaseUrl || "", 
  supabaseKey || ""
);

/* =====================================================
   SAVE AUTH LOG
===================================================== */
export const saveAuthLog = async (email: string, action: string) => {
  try {
    const { error } = await supabase
      .from("auth_logs")
      .insert([
        {
          email,
          action,
          timestamp: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error("Auth Log Error:", error.message);
    }
  } catch (err) {
    console.error("Unexpected Auth Error:", err);
  }
};

/* =====================================================
   GET ALL DESIGNS (Workspace/Dashboard View)
===================================================== */
export const getAllDesigns = async (userId: string) => {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from("designs")
      .select("*")
      .eq("user_id", userId)
      .eq("is_template", false) // Filter out pure layout templates from dashboard workspace
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Fetch Error:", error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Unexpected Fetch Error:", err);
    return [];
  }
};

/* =====================================================
   SAVE / AUTO-SAVE/ UPDATE DESIGN DATA
===================================================== */
export const saveDesign = async (params: {
  id?: string | null;
  userId: string;
  name: string;
  canvasJson: string;
  isTemplate?: boolean;
  templateType?: string;
}) => {
  try {
    const payload: any = {
      user_id: params.userId,
      name: params.name,
      canvas_json: params.canvasJson,
      is_template: params.isTemplate || false,
      template_type: params.templateType || null,
      updated_at: new Date().toISOString(),
    };

    // If an ID is provided, append it to update the existing row
    if (params.id) {
      payload.id = params.id;
    }

    const { data, error } = await supabase
      .from("designs")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error("Database Save Error:", error.message);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Unexpected Save Error:", err);
    return null;
  }
};

/* =====================================================
   GET SINGLE DESIGN BY ID (Loading Layouts)
===================================================== */
export const getDesignById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("designs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Fetch Single Design Error:", error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Unexpected Fetch Single Error:", err);
    return null;
  }
};

/* =====================================================
   TEMPLATE ENGINE METHODS
===================================================== */
export const getPrebuiltTemplates = async () => {
  try {
    const { data, error } = await supabase
      .from("designs")
      .select("*")
      .eq("is_template", true);

    if (error) {
      console.error("Fetch Templates Error:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Unexpected Templates Fetch Error:", err);
    return [];
  }
};