name: Feature Request
description: Suggest an idea for this project
title: "[FEATURE]: "
labels: ["enhancement", "needs-triage"]

body:
  - type: markdown
    attributes:
      value: |
        Thanks for the suggestion! Please describe the feature you'd like to see.

  - type: textarea
    id: problem
    attributes:
      label: Is your feature request related to a problem?
      description: Describe the problem or use case
      placeholder: I want to be able to...
    validations:
      required: true

  - type: textarea
    id: solution
    attributes:
      label: Proposed Solution
      description: How do you think this should work?
      placeholder: It could work like...
    validations:
      required: true

  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives Considered
      description: Have you considered other approaches?
      placeholder: Other options...
    validations:
      required: false

  - type: textarea
    id: context
    attributes:
      label: Additional Context
      description: Any other context?
      placeholder: Add any other context...
    validations:
      required: false
