/* =========================================================
   KIDORA REGISTRATION
   Supabase Auth + automatic profile creation
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


/* =========================================================
   SUPABASE CLIENT
========================================================= */

let supabaseClient = null;

try {

    if (!window.supabase) {
        throw new Error(
            "Supabase JavaScript library was not loaded."
        );
    }

    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );

    console.log("KIDORA: Supabase client created.");

} catch (error) {

    console.error(
        "KIDORA: Supabase initialization failed:",
        error
    );

}


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

const togglePassword =
    document.getElementById("togglePassword");

const toggleConfirmPassword =
    document.getElementById("toggleConfirmPassword");

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
        "auth-message " + type;

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

    button.addEventListener("click", function () {

        const isPassword =
            input.type === "password";

        input.type =
            isPassword ? "text" : "password";

        const icon =
            button.querySelector("i");

        if (icon) {

            icon.className =
                isPassword
                    ? "fa-solid fa-eye-slash"
                    : "fa-solid fa-eye";

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

function updatePasswordStrength() {

    if (!passwordInput) return;

    const password =
        passwordInput.value;

    if (!password) {

        if (strengthBar) {
            strengthBar.style.width = "0%";
        }

        if (strengthText) {
            strengthText.textContent =
                "Use at least 8 characters";
        }

        return;
    }


    let score = 0;


    /* Length */

    if (password.length >= 8)
        score++;

    if (password.length >= 12)
        score++;


    /* Lowercase */

    if (/[a-z]/.test(password))
        score++;


    /* Uppercase */

    if (/[A-Z]/.test(password))
        score++;


    /* Number */

    if (/[0-9]/.test(password))
        score++;


    /* Special */

    if (/[^A-Za-z0-9]/.test(password))
        score++;


    const percentage =
        Math.min(
            100,
            (score / 6) * 100
        );


    if (strengthBar) {

        strengthBar.style.width =
            percentage + "%";

    }


    if (strengthText) {

        if (score <= 2) {

            strengthText.textContent =
                "Weak password";

        } else if (score <= 4) {

            strengthText.textContent =
                "Moderate password";

        } else {

            strengthText.textContent =
                "Strong password";

        }

    }

}


if (passwordInput) {

    passwordInput.addEventListener(
        "input",
        updatePasswordStrength
    );

}


/* =========================================================
   GET SELECTED ROLE
========================================================= */

function getSelectedRole() {

    const selected =
        document.querySelector(
            'input[name="role"]:checked'
        );

    return selected
        ? selected.value
        : "child";
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
            "Please enter your full name."
        );

        fullNameInput.focus();

        return false;
    }


    if (email.length === 0) {

        showMessage(
            "Please enter your email address."
        );

        emailInput.focus();

        return false;
    }


    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailRegex.test(email)) {

        showMessage(
            "Please enter a valid email address."
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
            "Please agree to the Terms of Service and Privacy Policy."
        );

        termsInput.focus();

        return false;
    }


    const role =
        getSelectedRole();


    if (
        role !== "child" &&
        role !== "therapist"
    ) {

        showMessage(
            "Invalid account role."
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

        if (registerButtonIcon) {

            registerButtonIcon.className =
                "fa-solid fa-spinner fa-spin";

        }

    } else {

        registerButtonText.textContent =
            "Create Account";

        if (registerButtonIcon) {

            registerButtonIcon.className =
                "fa-solid fa-arrow-right";

        }

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


    clearMessage();


    /* -----------------------------------------------------
       CHECK SUPABASE
    ----------------------------------------------------- */

    if (!supabaseClient) {

        console.error(
            "Supabase client is unavailable."
        );

        showMessage(
            "KIDORA could not connect to Supabase. Check your Supabase configuration."
        );

        return;
    }


    /* -----------------------------------------------------
       VALIDATE
    ----------------------------------------------------- */

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


    console.log(
        "Registration details:",
        {
            fullName,
            email,
            role
        }
    );


    setLoading(true);


    try {

        /* =================================================
           CREATE AUTH ACCOUNT
        ================================================= */

        console.log(
            "Creating Supabase Auth account..."
        );


        const {
            data,
            error
        } =
            await supabaseClient.auth.signUp({

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

        if (error) {

            console.error(
                "Supabase Auth error:",
                error
            );

            throw error;
        }


        /* -------------------------------------------------
           VERIFY USER
        ------------------------------------------------- */

        if (!data || !data.user) {

            throw new Error(
                "Supabase did not return a user account."
            );

        }


        console.log(
            "Auth account created:",
            data.user.id
        );


        /* =================================================
           IMPORTANT
           
           DO NOT INSERT INTO public.profiles HERE.
           
           Your Supabase trigger:
           
           on_auth_user_created
           
           automatically creates the profile.
        ================================================= */


        /* -------------------------------------------------
           EMAIL CONFIRMATION
        ------------------------------------------------- */

        if (
            data.user.identities &&
            data.user.identities.length === 0
        ) {

            throw new Error(
                "An account with this email may already exist."
            );

        }


        /* =================================================
           SUCCESS
        ================================================= */

        if (data.session) {

            console.log(
                "KIDORA account created and session established."
            );

            showMessage(
                "Account created successfully! Redirecting...",
                "success"
            );


            setTimeout(
                () => {

                    window.location.href =
                        "dashboard.html";

                },
                1000
            );


        } else {

            console.log(
                "KIDORA account created. Email confirmation required."
            );


            showMessage(
                "Account created successfully! Please check your email to confirm your account.",
                "success"
            );


            setTimeout(
                () => {

                    window.location.href =
                        "login.html";

                },
                2500
            );

        }


    } catch (error) {

        console.error(
            "KIDORA Registration Error:",
            error
        );


        let message =
            "Registration failed. Please try again.";


        if (error && error.message) {

            const errorMessage =
                error.message.toLowerCase();


            if (
                errorMessage.includes(
                    "user already registered"
                )
            ) {

                message =
                    "An account with this email already exists. Please sign in instead.";

            } else if (
                errorMessage.includes(
                    "password"
                )
            ) {

                message =
                    error.message;

            } else if (
                errorMessage.includes(
                    "invalid email"
                )
            ) {

                message =
                    "Please enter a valid email address.";

            } else if (
                errorMessage.includes(
                    "rate limit"
                )
            ) {

                message =
                    "Too many registration attempts. Please wait a moment and try again.";

            } else {

                message =
                    error.message;

            }

        }


        showMessage(message);


    } finally {

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
   INITIALIZE
========================================================= */

console.log(
    "KIDORA registration page initializing..."
);


if (!registerForm) {

    console.error(
        "KIDORA: registerForm not found."
    );

} else {

    console.log(
        "KIDORA registration initialized."
    );

}