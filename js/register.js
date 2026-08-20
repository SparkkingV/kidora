/* =========================================================
   KIDORA REGISTER
========================================================= */

console.log("======================================");
console.log("KIDORA register.js loaded");
console.log("======================================");


/* =========================================================
   SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
    "https://vvaxscrxalmroycyarnk.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2YXhzY3J4YWxtcm95Y3lhcm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMDE5NDUsImV4cCI6MjEwMjc3Nzk0NX0.4YwldhokcYxC5HLJT0GldI0d2WWxF7vc8jm7Mq1W4KI";


const { createClient } =
    supabase.createClient(
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


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(message, type = "error") {

    if (!authMessage) return;

    authMessage.textContent = message;

    authMessage.className =
        `auth-message ${type}`;

}


/* =========================================================
   PASSWORD VISIBILITY
========================================================= */

function setupPasswordToggle(buttonId, inputId) {

    const button =
        document.getElementById(buttonId);

    const input =
        document.getElementById(inputId);

    if (!button || !input) return;


    button.addEventListener("click", () => {

        const isPassword =
            input.type === "password";

        input.type =
            isPassword
                ? "text"
                : "password";


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
    "togglePassword",
    "password"
);

setupPasswordToggle(
    "toggleConfirmPassword",
    "confirmPassword"
);


/* =========================================================
   PASSWORD STRENGTH
========================================================= */

function updatePasswordStrength() {

    if (!passwordInput) return;

    const password =
        passwordInput.value;


    if (!password) {

        strengthBar.style.width = "0%";

        strengthText.textContent =
            "Use at least 8 characters";

        return;

    }


    let score = 0;


    if (password.length >= 8)
        score++;

    if (password.length >= 12)
        score++;

    if (/[A-Z]/.test(password))
        score++;

    if (/[0-9]/.test(password))
        score++;

    if (/[^A-Za-z0-9]/.test(password))
        score++;


    let width = "20%";
    let text = "Very weak";


    if (score === 2) {

        width = "40%";
        text = "Weak";

    }

    else if (score === 3) {

        width = "60%";
        text = "Moderate";

    }

    else if (score === 4) {

        width = "80%";
        text = "Strong";

    }

    else if (score >= 5) {

        width = "100%";
        text = "Very strong";

    }


    strengthBar.style.width = width;

    strengthText.textContent = text;

}


if (passwordInput) {

    passwordInput.addEventListener(
        "input",
        updatePasswordStrength
    );

}


/* =========================================================
   GET ROLE
========================================================= */

function getSelectedRole() {

    const selected =
        document.querySelector(
            'input[name="role"]:checked'
        );


    if (!selected) {

        return "child";

    }


    return selected.value.toLowerCase();

}


/* =========================================================
   VALIDATE
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
            "Please enter your full name."
        );

        fullNameInput.focus();

        return false;

    }


    if (!email) {

        showMessage(
            "Please enter your email address."
        );

        emailInput.focus();

        return false;

    }


    if (password.length < 8) {

        showMessage(
            "Password must contain at least 8 characters."
        );

        passwordInput.focus();

        return false;

    }


    if (password !== confirmPassword) {

        showMessage(
            "Passwords do not match."
        );

        confirmPasswordInput.focus();

        return false;

    }


    if (!termsInput.checked) {

        showMessage(
            "Please accept the Terms of Service and Privacy Policy."
        );

        return false;

    }


    const role =
        getSelectedRole();


    if (
        role !== "child" &&
        role !== "therapist"
    ) {

        showMessage(
            "Please select a valid account type."
        );

        return false;

    }


    return true;

}


/* =========================================================
   BUTTON LOADING
========================================================= */

function setLoading(loading) {

    if (!registerButton) return;


    registerButton.disabled =
        loading;


    if (loading) {

        registerButtonText.textContent =
            "Creating Account...";


        registerButtonIcon.className =
            "fa-solid fa-spinner fa-spin";

    }

    else {

        registerButtonText.textContent =
            "Create Account";


        registerButtonIcon.className =
            "fa-solid fa-arrow-right";

    }

}


/* =========================================================
   REGISTER USER
========================================================= */

async function registerUser(event) {

    event.preventDefault();


    console.log(
        "KIDORA registration started..."
    );


    showMessage(
        "",
        ""
    );


    if (!validateForm()) {

        return;

    }


    const fullName =
        fullNameInput.value.trim();

    const email =
        emailInput.value.trim().toLowerCase();

    const password =
        passwordInput.value;

    const role =
        getSelectedRole();


    try {

        setLoading(true);


        console.log(
            "Creating Supabase Auth account..."
        );


        /*
         * IMPORTANT:
         *
         * We DO NOT insert into profiles here.
         *
         * The PostgreSQL trigger automatically
         * creates the profile after auth.users
         * receives the new account.
         */


        const {
            data,
            error
        } =
            await supabase.auth.signUp({

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


        if (error) {

            console.error(
                "KIDORA Auth Error:",
                error
            );


            if (
                error.message
                    ?.toLowerCase()
                    .includes("rate limit")
            ) {

                throw new Error(
                    "Too many registration attempts. Please wait a little before trying again."
                );

            }


            if (
                error.message
                    ?.toLowerCase()
                    .includes("database error saving new user")
            ) {

                throw new Error(
                    "Supabase could not create your account. Please check the Auth profile trigger."
                );

            }


            throw error;

        }


        if (!data?.user) {

            throw new Error(
                "Account creation did not return a user."
            );

        }


        console.log(
            "Auth account created:",
            data.user.id
        );


        /*
         * DO NOT CREATE PROFILE HERE.
         *
         * The database trigger handles it.
         */


        showMessage(
            "Account created successfully! Redirecting...",
            "success"
        );


        /*
         * If email confirmation is enabled,
         * session may be null.
         */

        if (!data.session) {

            showMessage(
                "Account created! Please check your email to verify your account.",
                "success"
            );


            setLoading(false);


            return;

        }


        /*
         * If email confirmation is disabled,
         * the user is immediately signed in.
         */

        setTimeout(() => {

            window.location.href =
                "../dashboard.html";

        }, 1000);


    }

    catch (error) {

        console.error(
            "KIDORA Registration Error:",
            error
        );


        showMessage(
            error.message ||
            "Registration failed. Please try again."
        );


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


/* =========================================================
   INITIALIZATION
========================================================= */

console.log(
    "KIDORA registration page initializing..."
);


console.log(
    "KIDORA registration initialized."
);