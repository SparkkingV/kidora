/* =========================================================
   KIDORA REGISTRATION
   Supabase Auth + Automatic Profile Trigger
========================================================= */

console.log("======================================");
console.log("KIDORA register.js loaded");
console.log("======================================");


/* =========================================================
   SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
    "https://vvaxscrxalmroycyarnk.supabase.co";

/*
   IMPORTANT:
   Replace this with your Supabase ANON / PUBLISHABLE KEY.

   Do NOT put the service_role key here.
*/

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2YXhzY3J4YWxtcm95Y3lhcm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMDE5NDUsImV4cCI6MjEwMjc3Nzk0NX0.4YwldhokcYxC5HLJT0GldI0d2WWxF7vc8jm7Mq1W4KI";


/* =========================================================
   CREATE SUPABASE CLIENT
========================================================= */

let kidoraSupabase = null;

try {

    if (
        typeof window.supabase === "undefined" ||
        typeof window.supabase.createClient !== "function"
    ) {

        throw new Error(
            "Supabase JavaScript library was not loaded."
        );
    }


    kidoraSupabase =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );


    console.log("KIDORA Supabase client created successfully.");

}
catch (error) {

    console.error(
        "KIDORA Supabase initialization failed:",
        error
    );

}


/* =========================================================
   DOM ELEMENTS
========================================================= */

const registerForm =
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
   MESSAGE SYSTEM
========================================================= */

function showMessage(message, type = "error") {

    if (!authMessage) {
        console.log(`[${type}] ${message}`);
        return;
    }

    authMessage.textContent = message;

    authMessage.className =
        `auth-message ${type}`;

    authMessage.style.display = "block";
}


function clearMessage() {

    if (!authMessage) return;

    authMessage.textContent = "";

    authMessage.className =
        "auth-message";

    authMessage.style.display = "none";
}


/* =========================================================
   PASSWORD VISIBILITY
========================================================= */

function setupPasswordToggle(button, input) {

    if (!button || !input) return;

    button.addEventListener("click", () => {

        const isPassword =
            input.type === "password";

        input.type =
            isPassword ? "text" : "password";


        const icon =
            button.querySelector("i");

        if (icon) {

            icon.classList.toggle(
                "fa-eye",
                !isPassword
            );

            icon.classList.toggle(
                "fa-eye-slash",
                isPassword
            );
        }


        button.setAttribute(
            "aria-label",
            isPassword
                ? "Hide password"
                : "Show password"
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

    if (!password) {
        return 0;
    }

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

    if (!passwordInput) return;

    const password =
        passwordInput.value;

    const score =
        calculatePasswordStrength(password);


    if (!strengthBar || !strengthText) {
        return;
    }


    if (!password) {

        strengthBar.style.width = "0%";

        strengthText.textContent =
            "Use at least 8 characters";

        return;
    }


    if (score <= 2) {

        strengthBar.style.width = "30%";

        strengthText.textContent =
            "Weak password";

    }
    else if (score <= 4) {

        strengthBar.style.width = "65%";

        strengthText.textContent =
            "Medium password";

    }
    else {

        strengthBar.style.width = "100%";

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
   PASSWORD MATCH VALIDATION
========================================================= */

function validatePasswords() {

    if (
        !passwordInput ||
        !confirmPasswordInput
    ) {
        return true;
    }


    const password =
        passwordInput.value;

    const confirmPassword =
        confirmPasswordInput.value;


    if (!confirmPassword) {
        return true;
    }


    if (password !== confirmPassword) {

        confirmPasswordInput.setCustomValidity(
            "Passwords do not match."
        );

        return false;
    }


    confirmPasswordInput.setCustomValidity("");

    return true;
}


if (confirmPasswordInput) {

    confirmPasswordInput.addEventListener(
        "input",
        validatePasswords
    );
}


if (passwordInput) {

    passwordInput.addEventListener(
        "input",
        validatePasswords
    );
}


/* =========================================================
   GET SELECTED ROLE
========================================================= */

function getSelectedRole() {

    const selectedRole =
        document.querySelector(
            'input[name="role"]:checked'
        );


    if (!selectedRole) {
        return "child";
    }


    const role =
        selectedRole.value;


    /*
       KIDORA only supports these roles.
       Anything else becomes child.
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
   BUTTON LOADING
========================================================= */

function setLoading(isLoading) {

    if (!registerButton) return;


    registerButton.disabled =
        isLoading;


    if (isLoading) {

        if (registerButtonText) {

            registerButtonText.textContent =
                "Creating Account...";
        }


        if (registerButtonIcon) {

            registerButtonIcon.className =
                "fa-solid fa-spinner fa-spin";
        }

    }
    else {

        if (registerButtonText) {

            registerButtonText.textContent =
                "Create Account";
        }


        if (registerButtonIcon) {

            registerButtonIcon.className =
                "fa-solid fa-arrow-right";
        }
    }
}


/* =========================================================
   VALIDATE FORM
========================================================= */

function validateRegistrationForm() {

    clearMessage();


    if (!fullNameInput.value.trim()) {

        showMessage(
            "Please enter your full name."
        );

        fullNameInput.focus();

        return false;
    }


    if (
        fullNameInput.value.trim().length < 2
    ) {

        showMessage(
            "Your name must contain at least 2 characters."
        );

        fullNameInput.focus();

        return false;
    }


    const email =
        emailInput.value.trim();


    if (!email) {

        showMessage(
            "Please enter your email address."
        );

        emailInput.focus();

        return false;
    }


    const password =
        passwordInput.value;


    if (password.length < 8) {

        showMessage(
            "Password must contain at least 8 characters."
        );

        passwordInput.focus();

        return false;
    }


    const confirmPassword =
        confirmPasswordInput.value;


    if (password !== confirmPassword) {

        showMessage(
            "Passwords do not match."
        );

        confirmPasswordInput.focus();

        return false;
    }


    if (
        termsInput &&
        !termsInput.checked
    ) {

        showMessage(
            "Please accept the Terms of Service and Privacy Policy."
        );

        termsInput.focus();

        return false;
    }


    return true;
}


/* =========================================================
   SUPABASE ERROR TRANSLATOR
========================================================= */

function getReadableAuthError(error) {

    if (!error) {
        return "Something went wrong.";
    }


    console.error(
        "Supabase Auth Error:",
        error
    );


    const message =
        error.message || "";


    const lower =
        message.toLowerCase();


    if (
        lower.includes("user already registered") ||
        lower.includes("already registered")
    ) {

        return (
            "An account with this email already exists. " +
            "Please sign in instead."
        );
    }


    if (
        lower.includes("invalid email")
    ) {

        return "Please enter a valid email address.";
    }


    if (
        lower.includes("password")
    ) {

        return (
            "The password does not meet Supabase's requirements."
        );
    }


    if (
        lower.includes("database error saving new user")
    ) {

        return (
            "Supabase could not create the account. " +
            "Please check the database trigger and profiles table."
        );
    }


    if (
        lower.includes("rate limit")
    ) {

        return (
            "Too many registration attempts. " +
            "Please wait a moment and try again."
        );
    }


    return message ||
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


    /* -----------------------------------------------------
       CHECK SUPABASE
    ----------------------------------------------------- */

    if (!kidoraSupabase) {

        showMessage(
            "KIDORA could not connect to Supabase. Please refresh the page."
        );

        console.error(
            "Supabase client is not initialized."
        );

        return;
    }


    /* -----------------------------------------------------
       VALIDATE FORM
    ----------------------------------------------------- */

    if (!validateRegistrationForm()) {
        return;
    }


    /* -----------------------------------------------------
       COLLECT DATA
    ----------------------------------------------------- */

    const fullName =
        fullNameInput.value.trim();

    const email =
        emailInput.value.trim().toLowerCase();

    const password =
        passwordInput.value;

    const role =
        getSelectedRole();


    console.log(
        "Registration data:",
        {
            fullName,
            email,
            role
        }
    );


    setLoading(true);


    try {

        /* =================================================
           CREATE SUPABASE AUTH ACCOUNT

           IMPORTANT:
           We DO NOT manually create a profiles row.

           The PostgreSQL trigger automatically creates:
           public.profiles
        ================================================= */

        console.log(
            "Creating Supabase Auth account..."
        );


        const {
            data,
            error
        } =
            await kidoraSupabase.auth.signUp({

                email: email,

                password: password,

                options: {

                    data: {

                        full_name: fullName,

                        role: role
                    }
                }
            });


        /* -------------------------------------------------
           HANDLE AUTH ERROR
        ------------------------------------------------- */

        if (error) {

            console.error(
                "KIDORA Auth Error:",
                error
            );

            throw error;
        }


        /* -------------------------------------------------
           VERIFY USER
        ------------------------------------------------- */

        if (!data || !data.user) {

            throw new Error(
                "Supabase did not return a user."
            );
        }


        console.log(
            "Auth account created:",
            data.user.id
        );


        /* =================================================
           IMPORTANT

           DO NOT INSERT INTO profiles HERE.

           Your database trigger does it automatically.
        ================================================= */


        /* -------------------------------------------------
           EMAIL CONFIRMATION
        ------------------------------------------------- */

        if (!data.session) {

            console.log(
                "Email confirmation is required."
            );


            showMessage(
                "Account created successfully! Please check your email to verify your account.",
                "success"
            );


            /*
               Give the user time to see the message.
            */

            setTimeout(() => {

                window.location.href =
                    "login.html";

            }, 2500);


            return;
        }


        /* =================================================
           SESSION EXISTS

           This means email confirmation is disabled.
        ================================================= */

        console.log(
            "KIDORA session created successfully."
        );


        showMessage(
            "Account created successfully! Redirecting...",
            "success"
        );


        setTimeout(() => {

            /*
               Change this if your dashboard filename
               is different.
            */

            window.location.href =
                "dashboard.html";

        }, 1200);

    }
    catch (error) {

        console.error(
            "KIDORA Registration Error:",
            error
        );


        showMessage(
            getReadableAuthError(error)
        );

    }
    finally {

        setLoading(false);
    }
}


/* =========================================================
   FORM EVENT
========================================================= */

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        registerUser
    );

}
else {

    console.error(
        "KIDORA registerForm not found."
    );
}


/* =========================================================
   INITIALIZATION
========================================================= */

console.log(
    "KIDORA registration page initializing..."
);


if (!registerForm) {

    console.error(
        "Registration form is missing."
    );
}
else {

    console.log(
        "KIDORA registration initialized."
    );
}


console.log(
    "======================================"
);