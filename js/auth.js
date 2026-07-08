document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle Elements & Setup
  const themeToggleBtn = document.getElementById('theme-toggle');
  const darkIcon = document.getElementById('theme-toggle-dark-icon');
  const lightIcon = document.getElementById('theme-toggle-light-icon');
  const htmlElement = document.documentElement;

  // Read saved theme or fallback to light
  const currentTheme = localStorage.getItem('theme') || 'light';
  htmlElement.setAttribute('data-theme', currentTheme);
  updateThemeIcons(currentTheme);

  themeToggleBtn.addEventListener('click', () => {
    const activeTheme = htmlElement.getAttribute('data-theme');
    const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcons(newTheme);
  });

  function updateThemeIcons(theme) {
    if (theme === 'dark') {
      darkIcon.classList.remove('hidden');
      lightIcon.classList.add('hidden');
    } else {
      darkIcon.classList.add('hidden');
      lightIcon.classList.remove('hidden');
    }
  }

  // Password Visibility Toggle
  const togglePasswordBtn = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('password');

  togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    const eyeIcon = document.getElementById('eye-icon');
    if (eyeIcon) {
      eyeIcon.textContent = type === 'password' ? 'visibility' : 'visibility_off';
    }
  });

  // Login Form Validation & Action
  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const errorSummary = document.getElementById('error-summary');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = submitBtn.querySelector('.btn-text');
  const spinner = submitBtn.querySelector('.spinner');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Clear old errors
    clearErrors();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    let isValid = true;
    let errors = [];

    // Email validation
    if (!email) {
      showFieldError(emailInput, emailError, 'Email address is required.');
      errors.push('Email address is required.');
      isValid = false;
    } else if (!validateEmail(email)) {
      showFieldError(emailInput, emailError, 'Please enter a valid email address (e.g. employee@company.com).');
      errors.push('Please enter a valid email format.');
      isValid = false;
    }

    // Password validation
    if (!password) {
      showFieldError(passwordInput, passwordError, 'Password is required.');
      errors.push('Password is required.');
      isValid = false;
    } else if (password.length < 6) {
      showFieldError(passwordInput, passwordError, 'Password must be at least 6 characters.');
      errors.push('Password must be at least 6 characters.');
      isValid = false;
    }

    if (!isValid) {
      showErrorSummary(errors);
      return;
    }

    // Standard demo check: let's allow admin@company.com / password123 as main, 
    // but also allow any email in corporate pattern if they want to try it out.
    // For specific error validation testing, if email is "test@error.com", we mock a server error.
    if (email === 'test@error.com') {
      showErrorSummary(['Database connection failed. Please try again.']);
      showFieldError(emailInput, emailError, 'System validation error.');
      return;
    }

    // Success simulation
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      
      // Store session state
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', email);
      
      // Redirect to dashboard page
      window.location.href = 'dashboard.html';
    }, 1500);
  });

  // Helper functions
  function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  }

  function showFieldError(input, errorElement, message) {
    input.classList.add('error');
    errorElement.textContent = message;
    errorElement.classList.add('active');
  }

  function clearErrors() {
    emailInput.classList.remove('error');
    passwordInput.classList.remove('error');
    emailError.textContent = '';
    emailError.classList.remove('active');
    passwordError.textContent = '';
    passwordError.classList.remove('active');
    errorSummary.classList.add('hidden');
    errorSummary.textContent = '';
  }

  function showErrorSummary(errors) {
    errorSummary.innerHTML = '<strong>Please correct the following errors:</strong><ul>' + 
      errors.map(err => `<li>${err}</li>`).join('') + 
      '</ul>';
    errorSummary.classList.remove('hidden');
  }

  function setLoading(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      btnText.textContent = 'Authenticating...';
      spinner.classList.remove('hidden');
    } else {
      submitBtn.disabled = false;
      btnText.textContent = 'Sign In';
      spinner.classList.add('hidden');
    }
  }

  // Pre-fill demo credentials for convenience
  if (!emailInput.value) {
    emailInput.value = 'admin@company.com';
    passwordInput.value = 'password123';
  }
});
