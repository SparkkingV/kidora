/* =========================================================
   KIDORA AUTHENTICATION
========================================================= */


/*
    IMPORTANT

    Replace these with your Supabase project details.
*/

const SUPABASE_URL =
    "https://vvaxscrxalmroycyarnk.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2YXhzY3J4YWxtcm95Y3lhcm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMDE5NDUsImV4cCI6MjEwMjc3Nzk0NX0.4YwldhokcYxC5HLJT0GldI0d2WWxF7vc8jm7Mq1W4KI";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* =================================================
           LOGIN
        ================================================== */

        const loginForm =
            document.getElementById("loginForm");


        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                handleLogin
            );

        }


        /* =================================================
           PASSWORD TOGGLE
        ================================================== */

        const togglePassword =
            document.getElementById(
                "togglePassword"
            );


        if (togglePassword) {

            togglePassword.addEventListener(
                "click",
                () => {

                    const password =
                        document.getElementById(
                            "password"
                        );

                    const icon =
                        togglePassword.querySelector(
                            "i"
                        );


                    if (
                        password.type ===
                        "password"
                    ) {

                        password.type =
                            "text";

                        icon.className =
                            "fa-solid fa-eye-slash";

                    }

                    else {

                        password.type =
                            "password";

                        icon.className =
                            "fa-solid fa-eye";

                    }

                }
            );

        }

    }
);


/* =========================================================
   LOGIN HANDLER
========================================================= */

async function handleLogin(event) {

    event.preventDefault();


    const email =
        document
            .getElementById("email")
            .value
            .trim();


    const password =
        document
            .getElementById("password")
            .value;


    const button =
        document.getElementById(
            "loginButton"
        );


    const error =
        document.getElementById(
            "authError"
        );


    error.classList.remove("show");

    button.classList.add("loading");


    button.innerHTML = `
        <i class="fa-solid fa-circle-notch fa-spin"></i>
        Signing in...
    `;


    try {


        /* ================================================
           SUPABASE LOGIN
        ================================================= */

        const {
            data,
            error: loginError
        } =
            await supabaseClient.auth.signInWithPassword({
                email,
                password
            });


        if (loginError) {

            throw loginError;

        }


        if (!data.user) {

            throw new Error(
                "Unable to authenticate user."
            );

        }


        /* ================================================
           GET USER ROLE
        ================================================= */

        const {
            data: profile,
            error: profileError
        } =
            await supabaseClient
                .from("profiles")
                .select("role")
                .eq("id", data.user.id)
                .single();


        if (profileError) {

            throw new Error(
                "User profile could not be loaded."
            );

        }


        /* ================================================
           ROLE REDIRECTION
        ================================================= */

        if (
            profile.role ===
            "therapist"
        ) {

            window.location.href =
                "../therapist/dashboard.html";

        }

        else if (
            profile.role ===
            "child"
        ) {

            window.location.href =
                "../child/dashboard.html";

        }

        else {

            throw new Error(
                "Invalid account role."
            );

        }

    }

    catch (err) {

        console.error(
            "KIDORA Login Error:",
            err
        );


        error.textContent =
            err.message ||
            "Login failed. Please try again.";


        error.classList.add(
            "show"
        );


        button.classList.remove(
            "loading"
        );


        button.innerHTML = `
            <span>Sign In</span>
            <i class="fa-solid fa-arrow-right"></i>
        `;

    }

}