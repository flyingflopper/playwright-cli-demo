name: Bug Report
description: Report a test failure or issue
title: "[BUG]: "
labels: ["bug", "needs-triage"]
assignees:
  - flyingflopper

body:
  - type: markdown
    attributes:
      value: |
        Thanks for reporting an issue! Please fill out as much detail as possible.

  - type: input
    id: contact
    attributes:
      label: Contact Details
      description: How can we reach you if we need more info?
      placeholder: email@example.com
    validations:
      required: false

  - type: textarea
    id: description
    attributes:
      label: Description
      description: What happened?
      placeholder: Tell us what you see!
    validations:
      required: true

  - type: textarea
    id: steps
    attributes:
      label: Steps to Reproduce
      description: How do you trigger this bug? Please walk us through it step by step.
      value: |
        1. 
        2. 
        3. 
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: What should happen?
      placeholder: Tell us what you expect!
    validations:
      required: true

  - type: textarea
    id: logs
    attributes:
      label: Test Output / Logs
      description: Please copy and paste any relevant test output or error logs
      render: shell
    validations:
      required: false

  - type: input
    id: playwright-version
    attributes:
      label: Playwright Version
      description: What version of Playwright are you using?
      placeholder: 1.58.2
    validations:
      required: false

  - type: input
    id: os
    attributes:
      label: Operating System
      description: What OS are you running tests on?
      placeholder: Windows 11, Ubuntu 22.04, macOS Ventura
    validations:
      required: false

  - type: dropdown
    id: browser
    attributes:
      label: Browser
      description: Which browser does this affect?
      options:
        - Chromium
        - Firefox
        - WebKit
        - All
    validations:
      required: false

  - type: checkboxes
    id: confirmed
    attributes:
      label: Confirmation
      options:
        - label: I have checked existing issues
          required: true
        - label: I have provided clear reproduction steps
          required: true
