"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface DunningStep {
  id?: string;
  step_order: number;
  subject: string;
  body: string;
  delay_value: number;
  delay_unit: string;
  image_url: string;
}

const BuilderPage = () => {
  const supabase = createClient();
  const [steps, setSteps] = useState<DunningStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchSteps() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("dunning_steps")
        .select("*")
        .eq("profile_id", user.id)
        .order("step_order", { ascending: true });

      if (error) {
        console.error("Error fetching steps:", error);
      }

      if (data && data.length > 0) {
        setSteps(data);
      } else {
        setSteps([{
          step_order: 1,
          subject: "Action Required: Payment Failed",
          body: "Hi there,\n\nWe couldn't process your recent payment. Please update your billing information to keep your subscription active.\n\nThanks!",
          delay_value: 1,
          delay_unit: "days",
          image_url: ""
        }]);
      }
      setLoading(false);
    }
    fetchSteps();
  }, [supabase]);

  const handleStepChange = (index: number, field: keyof DunningStep, value: string | number) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const addNewStep = () => {
    setSteps([...steps, {
      step_order: steps.length + 1,
      subject: "",
      body: "",
      delay_value: 3,
      delay_unit: "days",
      image_url: ""
    }]);
  };

  const removeStep = (indexToRemove: number) => {
    const newSteps = steps.filter((_, index) => index !== indexToRemove)
      .map((step, index) => ({ ...step, step_order: index + 1 })); 
    setSteps(newSteps);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setMessage("❌ Authentication error. Please log in again.");
        setSaving(false);
        return;
      }

      // First, clear existing steps to replace them with the new order/list
      const { error: deleteError } = await supabase
        .from("dunning_steps")
        .delete()
        .eq("profile_id", user.id);

      if (deleteError) {
        console.log("SUPABASE DELETE ERROR:", JSON.stringify(deleteError, null, 2));
        setMessage("❌ Failed to update workflows.");
        console.error(deleteError);
        setSaving(false);
        return;
      }

      // Build the exact payload, avoiding any unexpected keys from the state
      const stepsToInsert = steps.map((step, index) => ({
        profile_id: user.id,
        step_order: index + 1, // Enforce correct sequential order
        subject: step.subject || "",
        body: step.body || "",
        delay_value: Number(step.delay_value) || 1,
        delay_unit: step.delay_unit || "days",
        image_url: step.image_url || ""
      }));

      // Only insert if there are steps to save
      if (stepsToInsert.length > 0) {
        const { error } = await supabase.from("dunning_steps").insert(stepsToInsert);

        if (error) {
          console.log("SUPABASE EXACT ERROR:", JSON.stringify(error, null, 2));
          setMessage("❌ Failed to save workflows.");
          console.error(error);
          setSaving(false);
          return;
        }
      }

      setMessage("✓ Workflows saved successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Unexpected error during save:", err);
      setMessage("❌ An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-sm font-bold tracking-widest text-gray-400 uppercase animate-pulse">
        Loading workflows...
      </div>
    );
  }

  return (
    <div className="max-w-4xl pb-32 animate-in fade-in duration-500">
      <div className="mb-16 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black tracking-tight mb-2 text-[#1c1c1c]">
            Recovery Workflows
          </h1>
          <p className="text-sm font-medium text-gray-500">
            Design the email sequence that will be sent when a payment fails.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {message && (
            <span className={`text-xs font-bold uppercase tracking-widest ${message.includes("✓") ? "text-green-600" : "text-red-600"}`}>
              {message}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-8 py-3 rounded-full text-sm font-bold transition-all shadow-[0_10px_20px_rgba(37,99,235,0.2)] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save All Workflows"}
          </button>
        </div>
      </div>

      <div className="space-y-16">
        {steps.map((step, index) => (
          <div key={index} className="relative group">
            {index !== steps.length - 1 && (
              <div className="absolute left-6 top-24 bottom-[-4rem] w-px bg-gray-200 z-0"></div>
            )}
            
            <div className="relative z-10 flex gap-8">
              <div className="flex-shrink-0 mt-2">
                <div className="w-12 h-12 rounded-full bg-[#1c1c1c] text-white flex items-center justify-center font-black text-lg shadow-xl">
                  {index + 1}
                </div>
              </div>

              <div className="flex-1 space-y-6 pt-2">
                <div className="flex flex-wrap items-center gap-3 text-sm font-bold uppercase tracking-widest text-gray-500">
                  <span>Send this email</span>
                  <input
                    type="number"
                    min="1"
                    value={step.delay_value}
                    onChange={(e) => handleStepChange(index, "delay_value", parseInt(e.target.value) || 1)}
                    className="w-20 bg-gray-50 border-b-2 border-gray-300 text-[#1c1c1c] px-2 py-1 text-center focus:outline-none focus:border-[#2563eb] transition-colors"
                  />
                  <select
                    value={step.delay_unit}
                    onChange={(e) => handleStepChange(index, "delay_unit", e.target.value)}
                    className="bg-gray-50 border-b-2 border-gray-300 text-[#1c1c1c] px-2 py-1 cursor-pointer focus:outline-none focus:border-[#2563eb] transition-colors"
                  >
                    <option value="days">Days</option>
                    </select>
                  <span>after {index === 0 ? "payment fails" : "previous email"}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#1c1c1c]">Email Subject</label>
                    <input
                      type="text"
                      value={step.subject}
                      onChange={(e) => handleStepChange(index, "subject", e.target.value)}
                      placeholder="Action Required: Payment Failed"
                      className="w-full bg-transparent border-b border-gray-200 text-[#1c1c1c] text-lg py-2 focus:outline-none focus:border-[#2563eb] transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#1c1c1c]">Image / Video Thumbnail URL</label>
                    <input
                      type="url"
                      value={step.image_url || ""}
                      onChange={(e) => handleStepChange(index, "image_url", e.target.value)}
                      placeholder="https://example.com/thumbnail.jpg"
                      className="w-full bg-transparent border-b border-gray-200 text-[#1c1c1c] text-sm py-2.5 focus:outline-none focus:border-[#2563eb] transition-colors font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#1c1c1c]">Email Body</label>
                  <textarea
                    value={step.body}
                    onChange={(e) => handleStepChange(index, "body", e.target.value)}
                    rows={5}
                    placeholder="Write your recovery message here..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl text-[#1c1c1c] text-sm p-6 focus:outline-none focus:ring-2 focus:ring-[#2563eb] transition-all resize-y"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => removeStep(index)}
                    className="text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Remove Step
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-8 pl-20">
          <button
            onClick={addNewStep}
            className="group flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-[#2563eb] transition-colors"
          >
            <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 group-hover:border-[#2563eb] flex items-center justify-center transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            </div>
            Add Another Email Step
          </button>
        </div>

      </div>
    </div>
  );
};

export default BuilderPage;