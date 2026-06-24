"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import LogoutButton from "@/app/components/LogoutButton";

const MAX_GALLERY_PHOTOS = 10;
const MIN_AGE = 18;
const MAX_AGE = 99;
const MAX_SHORT_TEXT = 75;
const MAX_SELF_DESCRIBE = 50;
const MAX_TEXTAREA = 300;

const IDENTIFY_SELF_DESCRIBE = "Prefer to self-describe";
const OPEN_SELF_DESCRIBE = "Prefer to self-describe";

const profileOptions = {
  identify_as: ["Woman", "Man", "Non-binary", IDENTIFY_SELF_DESCRIBE],
  open_to_meeting: [
    "Women",
    "Men",
    "Non-binary",
    "Anybody",
    "Not sure yet",
    OPEN_SELF_DESCRIBE,
  ],
  education: [
    "High School",
    "Some College",
    "Associate Degree",
    "Bachelor's Degree",
    "Master's Degree",
    "Doctorate",
    "Trade School",
    "Other",
  ],
  height: [
    "4'10",
    "4'11",
    "5'0",
    "5'1",
    "5'2",
    "5'3",
    "5'4",
    "5'5",
    "5'6",
    "5'7",
    "5'8",
    "5'9",
    "5'10",
    "5'11",
    "6'0",
    "6'1",
    "6'2",
    "6'3",
    "6'4",
    "6'5",
  ],
};

const selfOptions = {
  self_party_role: [
    "Hosting like it’s my event",
    "In the kitchen talking to one person",
    "Petting the dog",
    "Quietly planning my Irish goodbye",
  ],
  self_sunday_energy: [
    "Church, brunch, reset",
    "Gym and errands like a responsible adult",
    "Family time",
    "Practicing competitive lounging",
    "A spontaneous adventure I’ll regret Monday",
  ],
  self_guilty_pleasure: [
    "Reality TV with elite commentary",
    "Ordering food when groceries exist",
    "Rewatching the same comfort show",
    "Buying things and calling it self-care",
    "Taking naps like it’s a sport",
  ],
  self_comfort_food: [
    "Pasta fixes everything",
    "Tacos, always",
    "A suspicious amount of fries",
    "Soup like someone’s grandma made it",
    "Dessert first. I’m grown.",
  ],
  self_travel_style: [
    "Spreadsheet itinerary",
    "Loose plan, good vibes",
    "Find food first, figure life out later",
    "Beach, nap, repeat",
    "I become a different person at the airport",
  ],
  self_apology_style: [
    "I say it directly",
    "I need a minute, then I’m honest",
    "I make a joke, then get serious",
    "I show it through actions",
    "I bring snacks as a peace offering",
  ],
  self_stress_behavior: [
    "I get quiet",
    "I clean everything",
    "I overthink professionally",
    "I need reassurance",
    "I pretend I’m fine and then need a nap",
  ],
  self_family_friend_role: [
    "The responsible one",
    "The funny one",
    "The therapist friend",
    "The planner",
    "The wildcard with a good heart",
  ],
  profile_public_consent: [
    "Yes, share my profile with potential matches",
    "Only share with connector-approved matches",
    "Not yet, keep my profile private",
  ],
};

type Step = {
  source: "profile" | "questionnaire";
  field: string;
  type: "text" | "number" | "select" | "single" | "multi" | "textarea";
  title: string;
  subtitle?: string;
  placeholder?: string;
  options?: string[];
  maxSelections?: number;
  maxLength?: number;
};

const steps: Step[] = [
  {
    source: "profile",
    field: "full_name",
    type: "text",
    title: "What name should appear on your profile?",
    placeholder: "Full Name",
    maxLength: MAX_SHORT_TEXT,
  },
  {
    source: "profile",
    field: "age",
    type: "number",
    title: "How old are you?",
    subtitle: "You must be at least 18 to create a profile.",
    placeholder: "Age",
  },
  {
    source: "profile",
    field: "location",
    type: "text",
    title: "Where are you located?",
    placeholder: "Silver Spring, MD",
    maxLength: MAX_SHORT_TEXT,
  },
  {
    source: "profile",
    field: "height",
    type: "select",
    title: "What is your height?",
    options: profileOptions.height,
  },
  {
    source: "profile",
    field: "identify_as",
    type: "single",
    title: "How do you identify?",
    options: profileOptions.identify_as,
  },
  {
    source: "profile",
    field: "open_to_meeting",
    type: "multi",
    title: "Who are you open to meeting?",
    subtitle: "Choose all that apply.",
    options: profileOptions.open_to_meeting,
  },
  {
    source: "profile",
    field: "education",
    type: "select",
    title: "What is your education background?",
    options: profileOptions.education,
  },
  {
    source: "profile",
    field: "industry",
    type: "text",
    title: "What industry do you work in?",
    placeholder: "Tech, healthcare, education, real estate...",
    maxLength: MAX_SHORT_TEXT,
  },
  {
    source: "questionnaire",
    field: "self_party_role",
    type: "single",
    title: "At a party, people can usually find me...",
    options: selfOptions.self_party_role,
  },
  {
    source: "questionnaire",
    field: "self_sunday_energy",
    type: "single",
    title: "My ideal Sunday energy is...",
    options: selfOptions.self_sunday_energy,
  },
  {
    source: "questionnaire",
    field: "self_guilty_pleasure",
    type: "single",
    title: "My guilty pleasure is...",
    options: selfOptions.self_guilty_pleasure,
  },
  {
    source: "questionnaire",
    field: "self_comfort_food",
    type: "single",
    title: "My emotional support food is...",
    options: selfOptions.self_comfort_food,
  },
  {
    source: "questionnaire",
    field: "self_unhinged_opinion",
    type: "textarea",
    title: "What is your most harmless but unhinged opinion?",
    placeholder:
      "Example: Brunch is overrated. Ranch belongs on everything. Airport outfits matter.",
  },
  {
    source: "questionnaire",
    field: "self_secret_talent",
    type: "textarea",
    title: "What is a secret talent or weirdly specific skill you have?",
    placeholder:
      "Parallel parking, remembering birthdays, finding the best food spot...",
  },
  {
    source: "questionnaire",
    field: "self_friends_warning",
    type: "textarea",
    title: "What would your closest friend warn someone about you?",
    placeholder: "Be honest. Be funny. Be slightly exposed.",
  },
  {
    source: "questionnaire",
    field: "self_friends_brag",
    type: "textarea",
    title: "What would your best friend brag about?",
    placeholder: "What makes you a catch?",
  },
  {
    source: "questionnaire",
    field: "self_green_flag",
    type: "textarea",
    title: "What is your most underrated green flag?",
    placeholder: "Something small but meaningful about you.",
  },
  {
    source: "questionnaire",
    field: "self_ick",
    type: "textarea",
    title: "What gives you an irrational ick?",
    placeholder: "Keep it playful. No essays. Unless the ick deserves it.",
  },
  {
    source: "questionnaire",
    field: "self_soft_spot",
    type: "textarea",
    title: "What is your biggest soft spot?",
    placeholder: "Dogs, grandparents, handwritten notes, people who try...",
  },
  {
    source: "questionnaire",
    field: "self_hype_song",
    type: "textarea",
    title: "What song instantly fixes your mood?",
    placeholder: "The one that makes you emotionally unavailable to bad vibes.",
  },
  {
    source: "questionnaire",
    field: "self_first_round_order",
    type: "textarea",
    title: "First round is on us. What are you ordering?",
    placeholder: "Coffee, mocktail, margarita, water because you’re responsible...",
  },
  {
    source: "questionnaire",
    field: "self_travel_style",
    type: "single",
    title: "What kind of traveler are you?",
    options: selfOptions.self_travel_style,
  },
  {
    source: "questionnaire",
    field: "self_never_shuts_up_about",
    type: "textarea",
    title: "What could you talk about for 45 minutes with no preparation?",
    placeholder: "A hobby, show, niche obsession, family story, conspiracy...",
  },
  {
    source: "questionnaire",
    field: "self_little_luxury",
    type: "textarea",
    title: "What tiny luxury makes you feel rich?",
    placeholder: "Clean sheets, fresh haircut, good coffee, no traffic...",
  },
  {
    source: "questionnaire",
    field: "self_apology_style",
    type: "single",
    title: "When you mess up, your apology style is...",
    options: selfOptions.self_apology_style,
  },
  {
    source: "questionnaire",
    field: "self_stress_behavior",
    type: "single",
    title: "When life gets stressful, I usually...",
    options: selfOptions.self_stress_behavior,
  },
  {
    source: "questionnaire",
    field: "self_family_friend_role",
    type: "single",
    title: "In my family or friend group, I am usually...",
    options: selfOptions.self_family_friend_role,
  },
  {
    source: "questionnaire",
    field: "self_core_memory",
    type: "textarea",
    title: "What is a core memory that explains you a little?",
    placeholder: "Funny, sweet, chaotic, or unexpectedly deep.",
  },
  {
    source: "questionnaire",
    field: "self_vulnerable_truth",
    type: "textarea",
    title: "What is something people only learn once they really know you?",
    placeholder: "Keep it real, but only share what you’re comfortable sharing.",
  },
  {
    source: "questionnaire",
    field: "self_connector_note",
    type: "textarea",
    title: "What should a connector know to describe you well?",
    placeholder: "Give them the sentence you wish people understood about you.",
  },
  {
    source: "questionnaire",
    field: "profile_public_consent",
    type: "single",
    title: "Are you okay with us sharing your profile?",
    subtitle:
      "This allows Invite Me to the Wedding to show your profile to potential matches and connectors.",
    options: selfOptions.profile_public_consent,
  },
];

function isPresetIdentifyValue(value: string) {
  return profileOptions.identify_as.includes(value);
}

function getOpenSelfDescribeValue(values: string[]) {
  return values.find((value) => value.startsWith(`${OPEN_SELF_DESCRIBE}: `)) || "";
}

function getOpenSelfDescribeText(values: string[]) {
  const stored = getOpenSelfDescribeValue(values);
  return stored.replace(`${OPEN_SELF_DESCRIBE}: `, "");
}

function cleanOpenToMeeting(values: string[]) {
  if (values.includes("Anybody")) {
    return ["Anybody"];
  }

  return values;
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<any>({});
  const [questionnaire, setQuestionnaire] = useState<any>({});
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [editingProfile, setEditingProfile] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [identifySelfDescribeText, setIdentifySelfDescribeText] = useState("");
  const [openSelfDescribeText, setOpenSelfDescribeText] = useState("");
  const [message, setMessage] = useState("");

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;
  const progress = ((step + 1) / steps.length) * 100;
  const photos = useMemo(() => profile?.gallery_urls || [], [profile]);

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      alert(profileError.message);
      setLoading(false);
      return;
    }

    if (!profileData?.validated) {
      router.push("/dashboard");
      return;
    }

    const { data: questionnaireData } = await supabase
      .from("questionnaires")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const storedIdentifyAs = profileData?.identify_as || "";
    const openToMeeting = profileData?.open_to_meeting || [];
    const isCustomIdentify =
      storedIdentifyAs && !isPresetIdentifyValue(storedIdentifyAs);

    setIdentifySelfDescribeText(isCustomIdentify ? storedIdentifyAs : "");
    setOpenSelfDescribeText(getOpenSelfDescribeText(openToMeeting));

    const isProfileComplete = Boolean(questionnaireData?.profile_completed);

    setProfile({
      ...profileData,
      full_name:
        profileData?.full_name ||
        [profileData?.first_name, profileData?.last_name]
          .filter(Boolean)
          .join(" "),
      identify_as: isCustomIdentify ? IDENTIFY_SELF_DESCRIBE : storedIdentifyAs,
      gallery_urls: profileData?.gallery_urls || [],
      open_to_meeting: openToMeeting,
    });

    setQuestionnaire({
      self_party_role: "",
      self_sunday_energy: "",
      self_guilty_pleasure: "",
      self_comfort_food: "",
      self_unhinged_opinion: "",
      self_secret_talent: "",
      self_friends_warning: "",
      self_friends_brag: "",
      self_green_flag: "",
      self_ick: "",
      self_soft_spot: "",
      self_hype_song: "",
      self_first_round_order: "",
      self_travel_style: "",
      self_never_shuts_up_about: "",
      self_little_luxury: "",
      self_apology_style: "",
      self_stress_behavior: "",
      self_family_friend_role: "",
      self_core_memory: "",
      self_vulnerable_truth: "",
      self_connector_note: "",
      profile_public_consent: "",
      profile_completed: false,
      ...(questionnaireData || {}),
    });

    setProfileCompleted(isProfileComplete);
    setEditingProfile(!isProfileComplete);
    setLoading(false);
  }

  function updateProfile(field: string, value: any) {
    setMessage("");
    setProfile((prev: any) => ({ ...prev, [field]: value }));
  }

  function updateQuestion(field: string, value: any) {
    setMessage("");
    setQuestionnaire((prev: any) => ({ ...prev, [field]: value }));
  }

  function toggleMulti(
    source: "profile" | "questionnaire",
    field: string,
    value: string
  ) {
    const activeStep = steps[step];
    const maxSelections = activeStep.maxSelections;
    const setter = source === "profile" ? setProfile : setQuestionnaire;

    setter((prev: any) => {
      let current = prev[field] || [];
      const selfDescribeStoredValue = getOpenSelfDescribeValue(current);
      const alreadySelected =
        value === OPEN_SELF_DESCRIBE
          ? Boolean(selfDescribeStoredValue)
          : current.includes(value);

      if (alreadySelected) {
        setMessage("");

        if (value === OPEN_SELF_DESCRIBE) {
          setOpenSelfDescribeText("");
          return {
            ...prev,
            [field]: current.filter(
              (item: string) => !item.startsWith(`${OPEN_SELF_DESCRIBE}: `)
            ),
          };
        }

        return {
          ...prev,
          [field]: current.filter((item: string) => item !== value),
        };
      }

      if (maxSelections && current.length >= maxSelections) {
        setMessage(
          `You can only choose up to ${maxSelections}. Please deselect one before choosing another.`
        );
        return prev;
      }

      setMessage("");

      if (value === "Anybody") {
        setOpenSelfDescribeText("");
        return {
          ...prev,
          [field]: ["Anybody"],
        };
      }

      current = current.filter((item: string) => item !== "Anybody");

      if (value === OPEN_SELF_DESCRIBE) {
        return {
          ...prev,
          [field]: [...current, `${OPEN_SELF_DESCRIBE}: `],
        };
      }

      return {
        ...prev,
        [field]: cleanOpenToMeeting([...current, value]),
      };
    });
  }

  function isAnswered() {
    const data = currentStep.source === "profile" ? profile : questionnaire;
    const value = data[currentStep.field];

    if (currentStep.field === "age") {
      const age = Number(value);
      return Boolean(age && age >= MIN_AGE && age <= MAX_AGE);
    }

    if (currentStep.field === "identify_as" && value === IDENTIFY_SELF_DESCRIBE) {
      return identifySelfDescribeText.trim().length > 0;
    }

    if (currentStep.field === "open_to_meeting") {
      if (!Array.isArray(value) || value.length === 0) return false;

      const selectedSelfDescribe = value.some((item: string) =>
        item.startsWith(`${OPEN_SELF_DESCRIBE}: `)
      );

      if (selectedSelfDescribe) {
        return openSelfDescribeText.trim().length > 0;
      }
    }

    if (Array.isArray(value)) return value.length > 0;

    return String(value || "").trim().length > 0;
  }

  async function saveProfile(finalSubmit = false) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return false;
    }

    setSaving(true);

    const galleryUrls = profile.gallery_urls || [];

    const identifyAsToSave =
      profile.identify_as === IDENTIFY_SELF_DESCRIBE
        ? identifySelfDescribeText.trim()
        : profile.identify_as || "";

    const openToMeetingToSave = (profile.open_to_meeting || []).map(
      (item: string) => {
        if (item.startsWith(`${OPEN_SELF_DESCRIBE}: `)) {
          return `${OPEN_SELF_DESCRIBE}: ${openSelfDescribeText.trim()}`;
        }

        return item;
      }
    );

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name || "",
        age: profile.age ? Number(profile.age) : null,
        location: profile.location || "",
        height: profile.height || "",
        identify_as: identifyAsToSave,
        open_to_meeting: cleanOpenToMeeting(openToMeetingToSave),
        education: profile.education || "",
        industry: profile.industry || "",
        gallery_urls: galleryUrls,
        profile_photo_url: galleryUrls[0] || null,
      })
      .eq("id", user.id);

    const { error: questionnaireError } = await supabase
      .from("questionnaires")
      .upsert(
        {
          user_id: user.id,
          ...questionnaire,
          profile_completed:
            finalSubmit || questionnaire.profile_completed || false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    setSaving(false);

    if (profileError || questionnaireError) {
      setMessage(
        profileError?.message ||
          questionnaireError?.message ||
          "Something went wrong."
      );
      return false;
    }

    return true;
  }

  async function saveGalleryImmediately(updatedGallery: string[]) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return false;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        gallery_urls: updatedGallery,
        profile_photo_url: updatedGallery[0] || null,
      })
      .eq("id", user.id);

    if (error) {
      setMessage(error.message);
      return false;
    }

    return true;
  }

  async function goNext() {
    setMessage("");

    if (!isAnswered()) {
      if (currentStep.field === "age") {
        setMessage("You must be at least 18 years old.");
      } else {
        setMessage("Please answer this question before continuing.");
      }

      return;
    }

    const saved = await saveProfile(false);
    if (!saved) return;

    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  }

  function goBack() {
    setMessage("");
    setStep((prev) => Math.max(prev - 1, 0));
  }

  async function submitProfile() {
    setMessage("");

    if ((profile.gallery_urls || []).length === 0) {
      setMessage("Please upload at least one photo before submitting your profile.");
      return;
    }

    if (!isAnswered()) {
      if (currentStep.field === "age") {
        setMessage("You must be at least 18 years old.");
      } else {
        setMessage("Please answer this question before submitting.");
      }

      return;
    }

    const saved = await saveProfile(true);

    if (saved) {
      setProfileCompleted(true);
      setEditingProfile(false);
      setStep(0);
    }
  }

  async function uploadPhoto(file: File) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    const currentGallery = profile.gallery_urls || [];

    if (currentGallery.length >= MAX_GALLERY_PHOTOS) {
      setMessage("You can upload up to 10 photos. Remove one before adding another.");
      return;
    }

    setMessage("");
    setUploadingPhoto(true);

    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const filePath = `${user.id}/gallery-${Date.now()}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setUploadingPhoto(false);
      setMessage(uploadError.message);
      return;
    }

    const { data } = supabase.storage
      .from("profile-photos")
      .getPublicUrl(filePath);

    const updatedGallery = [...currentGallery, data.publicUrl];

    const saved = await saveGalleryImmediately(updatedGallery);

    setUploadingPhoto(false);

    if (!saved) return;

    setProfile((prev: any) => ({
      ...prev,
      gallery_urls: updatedGallery,
      profile_photo_url: updatedGallery[0] || null,
    }));

    setGalleryIndex(updatedGallery.length - 1);
    setMessage("Photo saved.");
  }

  async function removePhoto(indexToRemove: number) {
    const currentGallery = profile.gallery_urls || []
    const urlToRemove = currentGallery[indexToRemove]

    const updatedGallery = currentGallery.filter(
      (_: string, index: number) => index !== indexToRemove
    )

    setMessage('')
    setUploadingPhoto(true)

    try {
      if (urlToRemove) {
        const url = new URL(urlToRemove)

        const marker = '/object/public/profile-photos/'
        const filePath = decodeURIComponent(
          url.pathname.split(marker)[1] || ''
        )

        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from('profile-photos')
            .remove([filePath])

          if (storageError) {
            setMessage(storageError.message)
            return
          }
        }
      }

      const saved = await saveGalleryImmediately(updatedGallery)

      if (!saved) {
        return
      }

      setProfile((prev: any) => ({
        ...prev,
        gallery_urls: updatedGallery,
        profile_photo_url: updatedGallery[0] || null,
      }))

      setGalleryIndex(0)
      setMessage('Photo removed.')
    } catch (error) {
      console.error(error)
      setMessage('Could not remove photo. Please try again.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  function renderCurrentStep() {
    const sourceData = currentStep.source === "profile" ? profile : questionnaire;
    const value = sourceData[currentStep.field];

    if (currentStep.type === "text" || currentStep.type === "number") {
      return (
        <>
          <input
            type={currentStep.type}
            min={currentStep.field === "age" ? MIN_AGE : undefined}
            max={currentStep.field === "age" ? MAX_AGE : undefined}
            maxLength={currentStep.maxLength}
            placeholder={currentStep.placeholder || ""}
            value={value || ""}
            onChange={(e) =>
              currentStep.source === "profile"
                ? updateProfile(currentStep.field, e.target.value)
                : updateQuestion(currentStep.field, e.target.value)
            }
          />

          {currentStep.maxLength && (
            <p className="char-counter">
              {String(value || "").length}/{currentStep.maxLength}
            </p>
          )}
        </>
      );
    }

    if (currentStep.type === "textarea") {
      return (
        <>
          <textarea
            maxLength={MAX_TEXTAREA}
            placeholder={currentStep.placeholder || ""}
            value={value || ""}
            onChange={(e) => updateQuestion(currentStep.field, e.target.value)}
          />

          <p className="char-counter">
            {String(value || "").length}/{MAX_TEXTAREA}
          </p>
        </>
      );
    }

    if (currentStep.type === "select") {
      return (
        <select
          value={value || ""}
          onChange={(e) => updateProfile(currentStep.field, e.target.value)}
        >
          <option value="">Select one</option>
          {currentStep.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    return (
      <>
        <ChoiceGroup
          label={
            currentStep.field === "open_to_meeting"
              ? "Choose all that apply, or select Anybody"
              : currentStep.type === "multi"
                ? "Choose all that apply"
                : "Choose one"
          }
          options={currentStep.options || []}
          value={value || (currentStep.type === "multi" ? [] : "")}
          multi={currentStep.type === "multi"}
          onSelect={(selected) =>
            currentStep.type === "multi"
              ? toggleMulti(currentStep.source, currentStep.field, selected)
              : currentStep.source === "profile"
                ? updateProfile(currentStep.field, selected)
                : updateQuestion(currentStep.field, selected)
          }
        />

        {currentStep.field === "identify_as" &&
          profile.identify_as === IDENTIFY_SELF_DESCRIBE && (
            <>
              <input
                type="text"
                maxLength={MAX_SELF_DESCRIBE}
                placeholder="Please describe"
                value={identifySelfDescribeText}
                onChange={(e) => setIdentifySelfDescribeText(e.target.value)}
              />

              <p className="char-counter">
                {identifySelfDescribeText.length}/{MAX_SELF_DESCRIBE}
              </p>
            </>
          )}

        {currentStep.field === "open_to_meeting" &&
          Array.isArray(profile.open_to_meeting) &&
          profile.open_to_meeting.some((item: string) =>
            item.startsWith(`${OPEN_SELF_DESCRIBE}: `)
          ) && (
            <>
              <input
                type="text"
                maxLength={MAX_SELF_DESCRIBE}
                placeholder="Please describe"
                value={openSelfDescribeText}
                onChange={(e) => setOpenSelfDescribeText(e.target.value)}
              />

              <p className="char-counter">
                {openSelfDescribeText.length}/{MAX_SELF_DESCRIBE}
              </p>
            </>
          )}
      </>
    );
  }

  if (loading) {
    return <main className="profile-page">Loading...</main>;
  }

  return (
    <main className="profile-page">
      <div className="dashboard-nav profile-desktop-nav">
        <Link href="/profile" className="nav-btn">
          My Profile
        </Link>

        <Link href="/dashboard" className="nav-btn">
          Questionnaire
        </Link>

        <LogoutButton />
      </div>

      <details className="profile-mobile-menu">
        <summary>☰</summary>

        <div className="profile-mobile-dropdown">
          <Link href="/profile">My Profile</Link>
          <Link href="/dashboard">Questionnaire</Link>
          <LogoutButton />
        </div>
      </details>

      <section className="profile-setup-shell">
        <div className="profile-hero-copy">
          <p className="eyebrow">Invite Me to the Wedding</p>
          <h1>Your Love Story Starts Here</h1>
          <p>
            Add your favorite photos, then answer one question at a time so your
            connector can describe who you are, not just what you are looking for.
          </p>
        </div>

        <aside className="profile-photo-card">
          <div className="profile-photo-frame">
            {photos.length ? (
              <img src={photos[galleryIndex]} alt="Profile" />
            ) : (
              <div className="empty-photo">Add your first profile photo</div>
            )}
          </div>

          <div className="profile-photo-name">
            <h1>{profile.full_name || "Your Profile"}</h1>
            <p>
              {profile.age || "Age"} · {profile.location || "Location"}
            </p>
          </div>

          <label className="upload-btn full-upload">
            {uploadingPhoto
              ? "Saving Photo..."
              : `Add Photo (${photos.length}/10)`}

            <input
              type="file"
              accept="image/*"
              disabled={uploadingPhoto}
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (file) {
                  uploadPhoto(file);
                }

                e.currentTarget.value = "";
              }}
            />
          </label>

          <div className="mini-gallery">
            {photos.map((url: string, index: number) => (
              <div className="mini-photo" key={`${url}-${index}`}>
                <button
                  type="button"
                  className="remove-photo"
                  disabled={uploadingPhoto}
                  onClick={() => removePhoto(index)}
                >
                  ×
                </button>

                <button
                  type="button"
                  className={index === galleryIndex ? "active-mini" : ""}
                  onClick={() => setGalleryIndex(index)}
                >
                  <img src={url} alt="Thumbnail" />
                </button>
              </div>
            ))}
          </div>
        </aside>

        <section className="profile-editor">
          {!editingProfile && profileCompleted ? (
            <div className="questionnaire-complete profile-complete-card">
              <p className="questionnaire-eyebrow">Profile Complete</p>

              <h2>Your profile is ready.</h2>

              <p>
                You already finished this section. You can keep it as-is or jump
                back in to update your answers anytime.
              </p>

              <button
                type="button"
                className="submit-btn"
                onClick={() => {
                  setEditingProfile(true);
                  setStep(0);
                }}
              >
                Edit My Answers
              </button>
            </div>
          ) : (
            <>
              <div className="questionnaire-progress-wrap profile-progress-wrap">
                <p className="questionnaire-progress-text">
                  Question {step + 1} of {steps.length}
                </p>

                <div className="questionnaire-progress-bar">
                  <span style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="questionnaire-step-card profile-question-card">
                <button
                  type="button"
                  className="questionnaire-back-btn"
                  onClick={goBack}
                  disabled={step === 0 || saving}
                >
                  ↩
                </button>

                <p className="questionnaire-eyebrow">Profile Setup</p>

                <h2>{currentStep.title}</h2>

                {currentStep.subtitle && (
                  <p className="questionnaire-subtitle">
                    {currentStep.subtitle}
                  </p>
                )}

                {renderCurrentStep()}

                <div className="questionnaire-actions">
                  {isLastStep ? (
                    <button
                      type="button"
                      className="submit-btn"
                      onClick={submitProfile}
                      disabled={saving || uploadingPhoto}
                    >
                      {saving ? "Submitting..." : "Submit Profile"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="submit-btn"
                      onClick={goNext}
                      disabled={saving || uploadingPhoto}
                    >
                      {saving ? "Saving..." : "Next"}
                    </button>
                  )}
                </div>

                {message && <p className="message">{message}</p>}
              </div>
            </>
          )}
        </section>
      </section>
    </main>
  );
}

function ChoiceGroup({
  label,
  options,
  value,
  onSelect,
  multi = false,
}: {
  label: string;
  options: string[];
  value: string | string[];
  onSelect: (value: string) => void;
  multi?: boolean;
}) {
  return (
    <div className="choice-group">
      <label className="field-label">{label}</label>

      <div className="choice-pills pill-group">
        {options.map((option) => {
          const selected = multi
            ? Array.isArray(value) &&
              (value.includes(option) ||
                value.some((item) => item.startsWith(`${option}: `)))
            : value === option;

          return (
            <button
              key={option}
              type="button"
              className={
                selected
                  ? "pill choice-pill selected"
                  : "pill choice-pill"
              }
              onClick={() => onSelect(option)}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
