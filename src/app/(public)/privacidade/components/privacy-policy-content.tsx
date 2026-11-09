import { PRIVACY_POLICY_SECTIONS } from "@/lib/utils"

import { PrivacySectionBlock } from "./privacy-section-block"

export function PrivacyPolicyContent() {
  return (
    <div className="flex flex-col gap-8">
      {PRIVACY_POLICY_SECTIONS.map((section) => (
        <PrivacySectionBlock key={section.id} section={section} />
      ))}
    </div>
  )
}
