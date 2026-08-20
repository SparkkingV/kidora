/* =========================================================
   KIDORA
   REGISTRATION SCRIPT
   Supabase Auth + Profiles
========================================================= */

console.log("======================================");
console.log("KIDORA register.js loaded");
console.log("======================================");


/* =========================================================
   SUPABASE CONFIG
========================================================= */

const SUPABASE_URL = "https://vvaxscrxalmroycyarnk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2YXhzY3J4YWxtcm95Y3lhcm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMDE5NDUsImV4cCI6MjEwMjc3Nzk0NX0.4YwldhokcYxC5HLJT0GldI0d2WWxF7vc8jm7Mq1W4KI";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


/* =========================================================
   DOM
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

const registerButton =
    document.getElementById("registerButton");

const authMessage =
    document.getElementById("authMessage");

const passwordStrengthBar =
    document.querySelector(".strength-bar span");

const passwordStrengthText =
    document.querySelector(".password-strength small");


/* =========================================================
   MESSAGE SYSTEM
========================================================= */

function showMessage(message, type = "error") {

    if (!authMessage) {
        alert(message);
        return;
    }

    authMessage.textContent = message;

    authMessage.className =
        "auth-message show " + type;
}


function hideMessage() {

    if (!authMessage) return;

    authMessage.className =
        "auth-message";
}


/* =========================================================
   LOADING STATE
========================================================= */

function setLoading(loading) {

    if (!registerButton) return;

    if (loading) {

        registerButton.disabled = true;

        registerButton.classList.add("loading");

        registerButton.dataset.originalText =
            registerButton.innerHTML;

        registerButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Creating account...
        `;

    } else {

        registerButton.disabled = false;

        registerButton.classList.remove("loading");

        if (registerButton.dataset.originalText) {

            registerButton.innerHTML =
                registerButton.dataset.originalText;
        }
    }
}


/* =========================================================
   GET SELECTED ROLE
========================================================= */

function getSelectedRole() {

    const selected =
        document.querySelector(
            'input[name="role"]:checked'
        );

    if (!selected) {
        return null;
    }

    return selected.value;
}


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

    if (/[A-Z]/.test(password)) {
        score++;
    }

    if (/[a-z]/.test(password)) {
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

    const percentage =
        (score / 5) * 100;

    if (passwordStrengthBar) {

        passwordStrengthBar.style.width =
            percentage + "%";
    }

    if (!passwordStrengthText) return;

    if (!password) {

        passwordStrengthText.textContent =
            "Use at least 8 characters";

    } else if (score <= 2) {

        passwordStrengthText.textContent =
            "Weak password";

    } else if (score === 3) {

        passwordStrengthText.textContent =
            "Fair password";

    } else if (score === 4) {

        passwordStrengthText.textContent =
            "Good password";

    } else {

        passwordStrengthText.textContent =
            "Strong password";
    }
}


/* =========================================================
   PASSWORD VALIDATION
========================================================= */

function validatePassword(password) {

    if (password.length < 8) {

        return {
            valid: false,
            message:
                "Password must contain at least 8 characters."
        };
    }

    if (!/[A-Za-z]/.test(password)) {

        return {
            valid: false,
            message:
                "Password must contain at least one letter."
        };
    }

    if (!/[0-9]/.test(password)) {

        return {
            valid: false,
            message:
                "Password must contain at least one number."
        };
    }

    return {
        valid: true
    };
}


/* =========================================================
   EMAIL VALIDATION
========================================================= */

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);
}


/* =========================================================
   NAME VALIDATION
========================================================= */

function validateName(name) {

    if (!name) {

        return {
            valid: false,
            message: "Please enter your full name."
        };
    }

    if (name.length < 2) {

        return {
            valid: false,
            message: "Please enter a valid name."
        };
    }

    return {
        valid: true
    };
}


/* =========================================================
   TERMS VALIDATION
========================================================= */

function validateTerms() {

    const termsCheckbox =
        document.querySelector(
            '#terms, input[name="terms"]'
        );

    if (!termsCheckbox) {

        return true;
    }

    return termsCheckbox.checked;
}


/* =========================================================
   PROFILE CREATION
========================================================= */

async function createProfile(user, profileData) {

    console.log("Creating KIDORA profile...");

    const {
        data,
        error
    } = await supabaseClient
        .from("profiles")
        .insert([
            {
                id: user.id,

                full_name:
                    profileData.fullName,

                email:
                    profileData.email,

                role:
                    profileData.role,

                avatar_url:
                    null
            }
        ])
        .select()
        .single();


    if (error) {

        console.error(
            "Profile error:",
            error
        );

        throw error;
    }


    console.log(
        "Profile created successfully:",
        data
    );

    return data;
}


/* =========================================================
   REGISTER USER
========================================================= */

async function registerUser(event) {

    event.preventDefault();

    console.log(
        "KIDORA registration started..."
    );

    hideMessage();


    /* -----------------------------------------------------
       GET FORM DATA
    ----------------------------------------------------- */

    const fullName =
        fullNameInput
            ? fullNameInput.value.trim()
            : "";

    const email =
        emailInput
            ? emailInput.value.trim().toLowerCase()
            : "";

    const password =
        passwordInput
            ? passwordInput.value
            : "";

    const confirmPassword =
        confirmPasswordInput
            ? confirmPasswordInput.value
            : "";

    const role =
        getSelectedRole();


    /* -----------------------------------------------------
       VALIDATE NAME
    ----------------------------------------------------- */

    const nameValidation =
        validateName(fullName);

    if (!nameValidation.valid) {

        showMessage(
            nameValidation.message
        );

        return;
    }


    /* -----------------------------------------------------
       VALIDATE EMAIL
    ----------------------------------------------------- */

    if (!isValidEmail(email)) {

        showMessage(
            "Please enter a valid email address."
        );

        return;
    }


    /* -----------------------------------------------------
       VALIDATE ROLE
    ----------------------------------------------------- */

    if (!role) {

        showMessage(
            "Please select your account type."
        );

        return;
    }


    /* -----------------------------------------------------
       VALIDATE PASSWORD
    ----------------------------------------------------- */

    const passwordValidation =
        validatePassword(password);

    if (!passwordValidation.valid) {

        showMessage(
            passwordValidation.message
        );

        return;
    }


    /* -----------------------------------------------------
       CONFIRM PASSWORD
    ----------------------------------------------------- */

    if (password !== confirmPassword) {

        showMessage(
            "Passwords do not match."
        );

        return;
    }


    /* -----------------------------------------------------
       TERMS
    ----------------------------------------------------- */

    if (!validateTerms()) {

        showMessage(
            "Please accept the terms and conditions."
        );

        return;
    }


    /* -----------------------------------------------------
       START LOADING
    ----------------------------------------------------- */

    setLoading(true);


    try {

        /* =================================================
           CREATE SUPABASE AUTH USER
        ================================================= */

        console.log(
            "Creating Supabase Auth account..."
        );


        const {
            data: authData,
            error: authError
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


        /* -------------------------------------------------
           AUTH ERROR
        ------------------------------------------------- */

        if (authError) {

            console.error(
                "KIDORA Auth Error:",
                authError
            );


            if (
                authError.message
                    .toLowerCase()
                    .includes("rate limit")
            ) {

                throw new Error(
                    "Supabase email rate limit exceeded. " +
                    "Please wait before trying again."
                );
            }


            if (
                authError.message
                    .toLowerCase()
                    .includes("55 seconds")
            ) {

                throw new Error(
                    "Please wait about one minute " +
                    "before requesting another registration email."
                );
            }


            if (
                authError.message
                    .toLowerCase()
                    .includes("already registered")
            ) {

                throw new Error(
                    "An account with this email already exists. " +
                    "Please log in instead."
                );
            }


            throw authError;
        }


        /* -------------------------------------------------
           VERIFY USER
        ------------------------------------------------- */

        const user =
            authData?.user;


        if (!user) {

            throw new Error(
                "Account creation failed. " +
                "Supabase did not return a user."
            );
        }


        console.log(
            "Auth account created:",
            user.id
        );


        /* =================================================
           IMPORTANT
           
           If email confirmation is enabled,
           Supabase may NOT create an authenticated
           session yet.
           
           We can still create the profile because
           the database trigger/RLS setup should handle it.
        ================================================= */


        /* -------------------------------------------------
           CREATE PROFILE
        ------------------------------------------------- */

        try {

            await createProfile(
                user,
                {
                    fullName,
                    email,
                    role
                }
            );

        } catch (profileError) {

            console.error(
                "Profile error:",
                profileError
            );


            /*
               The Auth account already exists.

               Do NOT call signUp() again.
            */

            throw new Error(
                "Account created, but profile setup failed. " +
                "Please check the Supabase profiles table " +
                "and RLS policies."
            );
        }


        /* =================================================
           SUCCESS
        ================================================= */

        console.log(
            "KIDORA registration successful."
        );


        /* -------------------------------------------------
           EMAIL CONFIRMATION
        ------------------------------------------------- */

        if (
            authData.session === null
        ) {

            showMessage(
                "Account created successfully! " +
                "Please check your email and confirm your account.",
                "success"
            );


            /*
               Wait a little so the user can read
               the message.
            */

            setTimeout(() => {

                window.location.href =
                    "login.html";

            }, 3000);

        } else {

            showMessage(
                "Account created successfully!",
                "success"
            );


            setTimeout(() => {

                window.location.href =
                    "dashboard.html";

            }, 1500);
        }


    } catch (error) {

        console.error(
            "KIDORA Registration Error:",
            error
        );


        let message =
            "Registration failed. Please try again.";


        if (error?.message) {

            message =
                error.message;
        }


        showMessage(
            message,
            "error"
        );


    } finally {

        setLoading(false);
    }
}


/* =========================================================
   PASSWORD TOGGLE
========================================================= */

function setupPasswordToggle() {

    const toggles =
        document.querySelectorAll(
            ".password-toggle"
        );


    toggles.forEach(toggle => {

        toggle.addEventListener(
            "click",
            () => {

                const targetId =
                    toggle.dataset.target;


                const input =
                    targetId
                        ? document.getElementById(targetId)
                        : toggle
                            .closest(".input-wrapper")
                            ?.querySelector("input");


                if (!input) return;


                if (
                    input.type === "password"
                ) {

                    input.type = "text";


                    toggle.innerHTML =
                        '<i class="fa-solid fa-eye-slash"></i>';

                } else {

                    input.type = "password";


                    toggle.innerHTML =
                        '<i class="fa-solid fa-eye"></i>';
                }
            }
        );

    });
}


/* =========================================================
   ROLE SELECTION
========================================================= */

function setupRoleSelection() {

    const roleInputs =
        document.querySelectorAll(
            'input[name="role"]'
        );


    roleInputs.forEach(input => {

        input.addEventListener(
            "change",
            () => {

                console.log(
                    "Selected role:",
                    input.value
                );

            }
        );

    });
}


/* =========================================================
   REAL-TIME VALIDATION
========================================================= */

function setupValidation() {

    if (passwordInput) {

        passwordInput.addEventListener(
            "input",
            updatePasswordStrength
        );
    }


    if (
        confirmPasswordInput &&
        passwordInput
    ) {

        confirmPasswordInput.addEventListener(
            "input",
            () => {

                if (
                    confirmPasswordInput.value &&
                    confirmPasswordInput.value !==
                        passwordInput.value
                ) {

                    confirmPasswordInput.style.borderColor =
                        "rgba(255,80,100,.5)";

                } else {

                    confirmPasswordInput.style.borderColor =
                        "";
                }
            }
        );
    }
}


/* =========================================================
   AUTH STATE CHECK
========================================================= */

async function checkExistingSession() {

    try {

        const {
            data
        } =
            await supabaseClient.auth.getSession();


        if (
            data?.session
        ) {

            console.log(
                "User already logged in."
            );

            /*
               Don't automatically redirect here
               if this causes problems on the register page.
               
               Uncomment if desired:

               window.location.href =
                   "dashboard.html";
            */
        }

    } catch (error) {

        console.error(
            "Session check failed:",
            error
        );
    }
}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "KIDORA registration page initializing..."
        );


        if (registerForm) {

            registerForm.addEventListener(
                "submit",
                registerUser
            );

        } else {

            console.warn(
                "registerForm not found."
            );
        }


        setupPasswordToggle();

        setupRoleSelection();

        setupValidation();

        checkExistingSession();


        console.log(
            "KIDORA registration initialized."
        );
    }
);