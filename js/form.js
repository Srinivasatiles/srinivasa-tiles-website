// Srinivasa Tiles — enquiry form handling
// Uses Formspree (free tier) if configured; falls back to a mailto draft otherwise.

// Enquiries are delivered by Web3Forms (free) to the email tied to this access key.
const FORM_ENDPOINT = "https://api.web3forms.com/submit";
const WEB3FORMS_ACCESS_KEY = "6d28936b-d6ba-47f3-acd3-d4943eca525c";

function initEnquiryForm() {
  const form = document.getElementById("enquiryForm");
  if (!form) return;
  const successBox = document.getElementById("formSuccess");
  const submitBtn = document.getElementById("formSubmitBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const message = form.message.value.trim();

    if (!name || !phone) {
      alert("Please fill in your name and phone number.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    if (FORM_ENDPOINT) {
      try {
        const fd = new FormData(form);
        fd.append("access_key", WEB3FORMS_ACCESS_KEY);
        fd.append("subject", `New website enquiry from ${name}`);
        fd.append("from_name", "Srinivasa Tiles Website");
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Accept": "application/json" },
          body: fd,
        });
        if (res.ok) {
          showSuccess();
          return;
        }
        throw new Error("Form submission failed");
      } catch (err) {
        fallbackToEmail(name, email, phone, message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Enquiry";
      }
    } else {
      fallbackToEmail(name, email, phone, message);
      submitBtn.disabled = false;
      submitBtn.textContent = "Send Enquiry";
    }
  });

  function showSuccess() {
    form.style.display = "none";
    successBox.classList.add("show");
  }

  function fallbackToEmail(name, email, phone, message) {
    const subject = encodeURIComponent(`Enquiry from ${name} — Srinivasa Tiles website`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nProject details:\n${message}`
    );
    window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
  }
}

document.addEventListener("DOMContentLoaded", initEnquiryForm);
