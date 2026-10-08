import { useState } from "react";

export default function Settings() {
  const [settings, setSettings] = useState(() => {
  const savedSettings = localStorage.getItem("supportAISettings");

  if (savedSettings) {
    return JSON.parse(savedSettings);
  }

  return {
    emailNotifications: true,
    aiSuggestions: true,
    manualApproval: true,
  };
});

  function toggle(key) {
  setSettings((old) => {
    const updatedSettings = {
      ...old,
      [key]: !old[key],
    };

    localStorage.setItem(
      "supportAISettings",
      JSON.stringify(updatedSettings)
    );

    return updatedSettings;
  });
}

  const options = [
    {
      key: "emailNotifications",
      title: "Email Notifications",
      description: "Receive notifications about new support tickets.",
    },
    {
      key: "aiSuggestions",
      title: "AI Response Suggestions",
      description: "Show AI-generated replies in the ticket details.",
    },
    {
      key: "manualApproval",
      title: "Manual Approval",
      description: "Require an agent to approve AI-generated replies.",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure your support platform.
        </p>
      </div>

      <div className="max-w-3xl divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="pb-4 font-semibold">General Preferences</h2>

        {options.map((option) => (
          <div
            key={option.key}
            className="flex items-center justify-between gap-4 py-5"
          >
            <div>
              <p className="text-sm font-medium">{option.title}</p>
              <p className="mt-1 text-sm text-slate-500">
                {option.description}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={settings[option.key]}
              onClick={() => toggle(option.key)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                settings[option.key] ? "bg-blue-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                  settings[option.key] ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}