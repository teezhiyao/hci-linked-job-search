import { useState } from "react";
import { domainLabel, getStudyDomain } from "./study-domains";

export const STUDY_GROUP_STORAGE_KEY = "hci-study-group-v1";

function validGroup(value: string | null): number | null {
  const group = Number(value);
  return Number.isInteger(group) && group >= 1 && group <= 6 ? group : null;
}

export function getStudyGroup(): number {
  const urlGroup = validGroup(new URLSearchParams(window.location.search).get("group"));

  if (urlGroup) {
    localStorage.setItem(STUDY_GROUP_STORAGE_KEY, String(urlGroup));
    return urlGroup;
  }

  const storedGroup = validGroup(localStorage.getItem(STUDY_GROUP_STORAGE_KEY));
  if (storedGroup) return storedGroup;

  const randomValue = window.crypto?.getRandomValues
    ? window.crypto.getRandomValues(new Uint32Array(1))[0]
    : Math.floor(Math.random() * 2 ** 32);
  const group = (randomValue % 6) + 1;
  localStorage.setItem(STUDY_GROUP_STORAGE_KEY, String(group));
  return group;
}

export default function StudyGroupNotice() {
  const [group] = useState(getStudyGroup);
  const step = new URLSearchParams(window.location.search).get("step");
  const domain = domainLabel(getStudyDomain());

  return (
    <section className="study-group-notice" aria-label="PeerSurvey study group">
      <span>Your PeerSurvey assignment</span>
      <strong>Study group {group}</strong>
      {step && <p>Step {step} of 6 · {domain}</p>}
      <p>
        Enter <b>{group}</b> as your study-group number in PeerSurvey.
      </p>
    </section>
  );
}
