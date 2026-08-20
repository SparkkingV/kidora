/* =========================================================
   KIDORA REGISTRATION
   Supabase Auth + automatic profile trigger
========================================================= */

console.log("======================================");
console.log("KIDORA register.js loaded");
console.log("======================================");


/* =========================================================
   SUPABASE CONFIG
=========================================================

   IMPORTANT:
   Replace these two values with the SAME values used
   elsewhere in your KIDORA project.
========================================================= */

const SUPABASE_URL =
    "https://vvaxscrxalmroycyarnk.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2YXhzY3J4YWxtcm95Y3lhcm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMDE5NDUsImV4cCI6MjEwMjc3Nzk0NX0.4YwldhokcYxC5HLJT0GldI0d2WWxF7vc8jm7Mq1W4KI";


/* =========================================================
   SUPABASE CLIENT
========================================================= */

let supabaseClient = null;


function initializeSupabase() {

    console.log("Initializing Supabase...");

    /* Check library */

    if (
        typeof window.supabase === "undefined" ||
        typeof window.supabase.createClient !== "function"
    ) {

        console.error(
            "Supabase JavaScript library was not loaded."
        );

        showMessage(
            "Supabase failed to load. Please refresh the page.",
            "error"
        );

        return false;
    }


    /* Check configuration */

    if (
        !SUPABASE_URL ||
        !SUPABASE_ANON_KEY ||
        SUPABASE_ANON_KEY === "YOUR_SUPABASE_ANON_KEY"
    ) {

        console.error(
            "Supabase URL or ANON KEY is missing."
        );

        showMessage(
            "KIDORA configuration is incomplete.",
            "error"
        );

        return false;
    }


    try {

        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_ANON_KEY,
                {
                    auth: {
                        autoRefreshToken: true,
                        persistSession: true,
                        detectSessionInUrl: true
                    }
                }
            );


        console.log("Supabase client initialized.");

        return true;

    } catch (error) {

        console.error(
            "Supabase initialization error:",
            error
        );

        showMessage(
            "Unable to initialize KIDORA services.",
            "error"
        );

        return false;
    }
}


/* =========================================================
   DOM ELEMENTS
========================================================= */

const form =
    document.getElementById("registerForm");

const fullNameInput =
    document.getElementById("fullName");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const confirmPasswordInput =
    document.getElementById("confirmPassword");

const termsInput =
    document.getElementById("terms");

const registerButton =
    document.getElementById("registerButton");

const registerButtonText =
    document.getElementById("registerButtonText");

const registerButtonIcon =
    document.getElementById("registerButtonIcon");

const authMessage =
    document.getElementById("authMessage");

const strengthBar =
    document.getElementById("strengthBar");

const strengthText =
    document.getElementById("strengthText");

const togglePassword =
    document.getElementById("togglePassword");

const toggleConfirmPassword =
    document.getElementById("toggleConfirmPassword");


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(message, type = "error") {

    if (!authMessage) {
        return;
    }


    authMessage.textContent = message;

    authMessage.className =
        "auth-message " + type;

    authMessage.style.display = "block";
}


function clearMessage() {

    if (!authMessage) {
        return;
    }

    authMessage.textContent = "";

    authMessage.className =
        "auth-message";

    authMessage.style.display = "none";
}


/* =========================================================
   PASSWORD VISIBILITY
========================================================= */

function setupPasswordToggle(button, input) {

    if (!button || !input) {
        return;
    }


    button.addEventListener("click", function () {

        const showing =
            input.type === "text";


        input.type =
            showing ? "password" : "text";


        const icon =
            button.querySelector("i");


        if (icon) {

            icon.className =
                showing
                    ? "fa-solid fa-eye"
                    : "fa-solid fa-eye-slash";
        }


        button.setAttribute(
            "aria-label",
            showing
                ? "Show password"
                : "Hide password"
        );

    });
}


setupPasswordToggle(
    togglePassword,
    passwordInput
);

setupPasswordToggle(
    toggleConfirmPassword,
    confirmPasswordInput
);


/* =========================================================
   PASSWORD STRENGTH
========================================================= */

function calculatePasswordStrength(password) {

    let score = 0;


    if (password.length >= 8) {
        score++;
    }

    if (password.length >= 12) {
        score++;
    }

    if (/[a-z]/.test(password)) {
        score++;
    }

    if (/[A-Z]/.test(password)) {
        score++;
    }

    if (/[0-9]/.test(password)) {
        score++;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
        score++;
    }


    return score;
}


function updatePasswordStrength() {

    if (!passwordInput) {
        return;
    }


    const password =
        passwordInput.value;


    if (!password) {

        strengthBar.style.width = "0%";

        strengthText.textContent =
            "Use at least 8 characters";

        return;
    }


    const score =
        calculatePasswordStrength(password);


    const percentage =
        Math.min(
            100,
            Math.round((score / 6) * 100)
        );


    strengthBar.style.width =
        percentage + "%";


    if (score <= 2) {

        strengthText.textContent =
            "Weak password";

    } else if (score <= 4) {

        strengthText.textContent =
            "Medium password";

    } else {

        strengthText.textContent =
            "Strong password";
    }
}


if (passwordInput) {

    passwordInput.addEventListener(
        "input",
        updatePasswordStrength
    );
}


/* =========================================================
   ROLE
========================================================= */

function getSelectedRole() {

    const selected =
        document.querySelector(
            'input[name="role"]:checked'
        );


    if (!selected) {
        return "child";
    }


    const role =
        selected.value;


    /*
       SECURITY:
       Only roles supported by the database
       are allowed.
    */

    if (
        role !== "child" &&
        role !== "therapist"
    ) {

        return "child";
    }


    return role;
}


/* =========================================================
   VALIDATION
========================================================= */

function validateForm() {

    const fullName =
        fullNameInput.value.trim();

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;

    const confirmPassword =
        confirmPasswordInput.value;


    if (fullName.length < 2) {

        showMessage(
            "Please enter your full name.",
            "error"
        );

        fullNameInput.focus();

        return false;
    }


    if (!email) {

        showMessage(
            "Please enter your email address.",
            "error"
        );

        emailInput.focus();

        return false;
    }


    /*
       Basic email validation.
    */

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(email)) {

        showMessage(
            "Please enter a valid email address.",
            "error"
        );

        emailInput.focus();

        return false;
    }


    if (password.length < 8) {

        showMessage(
            "Password must contain at least 8 characters.",
            "error"
        );

        passwordInput.focus();

        return false;
    }


    if (password !== confirmPassword) {

        showMessage(
            "Passwords do not match.",
            "error"
        );

        confirmPasswordInput.focus();

        return false;
    }


    if (!termsInput.checked) {

        showMessage(
            "Please agree to the Terms of Service and Privacy Policy.",
            "error"
        );

        termsInput.focus();

        return false;
    }


    return true;
}


/* =========================================================
   BUTTON LOADING
========================================================= */

function setLoading(loading) {

    if (!registerButton) {
        return;
    }


    registerButton.disabled =
        loading;


    if (loading) {

        registerButtonText.textContent =
            "Creating Account...";


        registerButtonIcon.className =
            "fa-solid fa-spinner fa-spin";

    } else {

        registerButtonText.textContent =
            "Create Account";


        registerButtonIcon.className =
            "fa-solid fa-arrow-right";
    }
}


/* =========================================================
   ERROR TRANSLATION
========================================================= */

function getFriendlyAuthError(error) {

    if (!error) {
        return "Registration failed.";
    }


    const message =
        String(error.message || "").toLowerCase();


    if (
        message.includes("user already registered")
    ) {

        return "An account with this email already exists.";
    }


    if (
        message.includes("email rate limit")
    ) {

        return "Too many registration attempts. Please wait and try again.";
    }


    if (
        message.includes("password")
    ) {

        return "Please use a stronger password with at least 8 characters.";
    }


    if (
        message.includes("database error saving new user")
    ) {

        return (
            "Supabase could not create the account. " +
            "Please check the database trigger configuration."
        );
    }


    if (
        message.includes("invalid email")
    ) {

        return "Please enter a valid email address.";
    }


    return error.message ||
        "Registration failed. Please try again.";
}


/* =========================================================
   REGISTER USER
========================================================= */

async function registerUser(event) {

    event.preventDefault();


    console.log(
        "KIDORA registration started..."
    );


    clearMessage();


    /* ---------------------------------------------
       Check Supabase
    --------------------------------------------- */

    if (!supabaseClient) {

        console.error(
            "Supabase client is unavailable."
        );

        showMessage(
            "KIDORA services are not ready. Please refresh the page.",
            "error"
        );

        return;
    }


    /* ---------------------------------------------
       Validate
    --------------------------------------------- */

    if (!validateForm()) {
        return;
    }


    setLoading(true);


    try {

        const fullName =
            fullNameInput.value.trim();

        const email =
            emailInput.value
                .trim()
                .toLowerCase();

        const password =
            passwordInput.value;

        const role =
            getSelectedRole();


        console.log(
            "Creating Supabase Auth account..."
        );

        console.log(
            "Role:",
            role
        );


        /* =================================================
           IMPORTANT

           DO NOT INSERT INTO public.profiles HERE.

           The database trigger creates the profile
           automatically after auth.users is created.
        ================================================= */


        const {
            data,
            error
        } = await supabaseClient.auth.signUp({

            email: email,

            password: password,

            options: {

                data: {

                    full_name:
                        fullName,

                    role:
                        role
                }
            }
        });


        /* ---------------------------------------------
           Auth error
        --------------------------------------------- */

        if (error) {

            console.error(
                "KIDORA Auth Error:",
                error
            );

            throw error;
        }


        /* ---------------------------------------------
           Safety check
        --------------------------------------------- */

        if (!data || !data.user) {

            throw new Error(
                "Supabase did not return a user account."
            );
        }


        console.log(
            "Auth account created:",
            data.user.id
        );


        /* ---------------------------------------------
           IMPORTANT

           The database trigger should now have created:

           public.profiles

           We do NOT manually create it.
        --------------------------------------------- */


        /*
           Supabase email confirmation behavior:

           If email confirmation is enabled,
           session will normally be null.
        */

        if (!data.session) {

            showMessage(
                "Account created successfully! " +
                "Please check your email to verify your account.",
                "success"
            );


            setTimeout(() => {

                window.location.href =
                    "login.html";

            }, 3000);


            return;
        }


        /* ---------------------------------------------
           Session exists
        --------------------------------------------- */

        showMessage(
            "Account created successfully! Redirecting...",
            "success"
        );


        setTimeout(() => {

            window.location.href =
                "../dashboard.html";

        }, 1200);


    } catch (error) {

        console.error(
            "KIDORA Registration Error:",
            error
        );


        showMessage(
            getFriendlyAuthError(error),
            "error"
        );


    } finally {

        setLoading(false);
    }
}


/* =========================================================
   FORM EVENT
========================================================= */

if (form) {

    form.addEventListener(
        "submit",
        registerUser
    );

} else {

    console.error(
        "KIDORA registration form not found."
    );
}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "KIDORA registration page initializing..."
        );


        initializeSupabase();


        console.log(
            "KIDORA registration initialized."
        );

    }
);


/* =========================================================
   DEBUG
========================================================= */

console.log(
    "KIDORA registration script ready."
);