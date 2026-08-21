/* =========================================================
   KIDORA CHILD DASHBOARD
   child-dashboard.js
========================================================= */

"use strict";


/* =========================================================
   CONFIGURATION
========================================================= */

const KIDORA_CONFIG = {

    SUPABASE_URL:
        "https://vvaxscrxalmroycyarnk.supabase.co",

    /*
       IMPORTANT:
       Replace this with your Supabase PUBLIC ANON KEY.

       NEVER use the service_role key here.
    */

    SUPABASE_ANON_KEY:
        "YOUR_SUPABASE_ANON_KEY",

    LOGIN_PAGE:
        "login.html",

    THERAPIST_DASHBOARD:
        "therapist-dashboard.html",

    DEMO_MODE:
        false,

    TABLES: {

        PROFILES:
            "profiles",

        ACTIVITIES:
            "activities",

        THERAPY_SESSIONS:
            "therapy_sessions",

        GOALS:
            "therapy_goals",

        NOTIFICATIONS:
            "notifications",

        MESSAGES:
            "messages"
    }

};


/* =========================================================
   GLOBAL STATE
========================================================= */

let supabaseClient = null;

let currentUser = null;

let currentProfile = null;

let realtimeChannel = null;

let notificationChannel = null;


/* =========================================================
   LOGGING
========================================================= */

function log(...args) {

    console.log(
        "[KIDORA]",
        ...args
    );

}


function logError(...args) {

    console.error(
        "[KIDORA ERROR]",
        ...args
    );

}


/* =========================================================
   SUPABASE INITIALIZATION
========================================================= */

function initializeSupabase() {

    log("Initializing Supabase...");


    if (
        !window.supabase ||
        typeof window.supabase.createClient !== "function"
    ) {

        logError(
            "Supabase JavaScript library was not loaded."
        );

        return false;
    }


    if (
        !KIDORA_CONFIG.SUPABASE_URL ||
        !KIDORA_CONFIG.SUPABASE_ANON_KEY ||
        KIDORA_CONFIG.SUPABASE_ANON_KEY ===
            "YOUR_SUPABASE_ANON_KEY"
    ) {

        logError(
            "Supabase anon key has not been configured."
        );

        return false;
    }


    try {

        supabaseClient =
            window.supabase.createClient(
                KIDORA_CONFIG.SUPABASE_URL,
                KIDORA_CONFIG.SUPABASE_ANON_KEY,
                {
                    auth: {

                        persistSession: true,

                        autoRefreshToken: true,

                        detectSessionInUrl: true
                    }
                }
            );


        log(
            "Supabase initialized successfully."
        );


        return true;

    }

    catch (error) {

        logError(
            "Supabase initialization failed:",
            error
        );

        return false;
    }

}


/* =========================================================
   CHECK AUTHENTICATION
========================================================= */

async function checkAuthentication() {

    log(
        "Checking authentication..."
    );


    if (!supabaseClient) {

        if (KIDORA_CONFIG.DEMO_MODE) {

            log(
                "Demo mode enabled."
            );

            return true;
        }


        redirectToLogin();

        return false;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


        if (error) {

            throw error;
        }


        const session =
            data?.session;


        if (!session) {

            log(
                "No active session."
            );

            redirectToLogin();

            return false;
        }


        currentUser =
            session.user;


        log(
            "Authenticated:",
            currentUser.id
        );


        return true;

    }

    catch (error) {

        logError(
            "Authentication check failed:",
            error
        );


        redirectToLogin();

        return false;
    }

}


/* =========================================================
   REDIRECT LOGIN
========================================================= */

function redirectToLogin() {

    window.location.href =
        KIDORA_CONFIG.LOGIN_PAGE;

}


/* =========================================================
   LOAD USER PROFILE
========================================================= */

async function loadUserProfile() {

    log(
        "Loading child profile..."
    );


    if (!supabaseClient) {

        if (KIDORA_CONFIG.DEMO_MODE) {

            useDemoProfile();

            return true;
        }

        return false;
    }


    if (!currentUser) {

        const authenticated =
            await checkAuthentication();


        if (!authenticated) {

            return false;
        }
    }


    try {

        const {
            data: profile,
            error
        } =
            await supabaseClient
                .from(
                    KIDORA_CONFIG.TABLES.PROFILES
                )
                .select("*")
                .eq(
                    "id",
                    currentUser.id
                )
                .maybeSingle();


        if (error) {

            throw error;
        }


        /*
           If the profile doesn't exist,
           use Auth metadata temporarily.
        */

        if (!profile) {

            log(
                "No profile found."
            );


            currentProfile = {

                id:
                    currentUser.id,

                full_name:
                    currentUser.user_metadata?.full_name ||
                    currentUser.email?.split("@")[0] ||
                    "Child",

                email:
                    currentUser.email,

                role:
                    currentUser.user_metadata?.role ||
                    "child",

                avatar_url:
                    currentUser.user_metadata?.avatar_url ||
                    null
            };


            validateChildRole(
                currentProfile
            );


            updateUserUI(
                currentProfile
            );


            return true;
        }


        currentProfile =
            profile;


        log(
            "Profile loaded:",
            currentProfile
        );


        /*
           Make sure this is actually a child.
        */

        if (
            !validateChildRole(
                currentProfile
            )
        ) {

            return false;
        }


        updateUserUI(
            currentProfile
        );


        return true;

    }

    catch (error) {

        logError(
            "Profile loading failed:",
            error
        );


        /*
           Don't leave the dashboard completely
           blank if the profile table has an issue.
        */

        if (currentUser) {

            currentProfile = {

                id:
                    currentUser.id,

                full_name:
                    currentUser.user_metadata?.full_name ||
                    currentUser.email?.split("@")[0] ||
                    "Child",

                email:
                    currentUser.email,

                role:
                    "child"
            };


            updateUserUI(
                currentProfile
            );
        }


        showMessage(
            "Your profile could not be fully loaded.",
            "error"
        );


        return false;
    }

}


/* =========================================================
   VALIDATE CHILD ROLE
========================================================= */

function validateChildRole(profile) {

    if (!profile) {

        return true;
    }


    const role =
        String(
            profile.role || ""
        ).toLowerCase();


    if (
        role === "therapist"
    ) {

        log(
            "Therapist account detected."
        );


        window.location.href =
            KIDORA_CONFIG.THERAPIST_DASHBOARD;


        return false;
    }


    if (
        role &&
        role !== "child"
    ) {

        logError(
            "Unauthorized dashboard role:",
            role
        );


        showMessage(
            "This dashboard is only available for child accounts.",
            "error"
        );


        setTimeout(
            redirectToLogin,
            1500
        );


        return false;
    }


    return true;

}


/* =========================================================
   UPDATE USER INTERFACE
========================================================= */

function updateUserUI(profile) {

    if (!profile) {

        return;
    }


    const name =
        profile.full_name ||
        profile.name ||
        "Child";


    const firstName =
        name
            .trim()
            .split(/\s+/)[0] ||
        "Child";


    /* -----------------------------------------
       Welcome name
    ----------------------------------------- */

    const welcomeName =
        document.getElementById(
            "welcomeName"
        );


    if (welcomeName) {

        welcomeName.textContent =
            firstName;
    }


    /* -----------------------------------------
       Sidebar name
    ----------------------------------------- */

    const sidebarName =
        document.getElementById(
            "sidebarName"
        );


    if (sidebarName) {

        sidebarName.textContent =
            name;
    }


    /* -----------------------------------------
       Avatar
    ----------------------------------------- */

    const avatar =
        document.getElementById(
            "sidebarAvatar"
        );


    if (!avatar) {

        return;
    }


    const avatarURL =
        profile.avatar_url ||
        profile.profile_pic ||
        profile.avatar ||
        null;


    if (avatarURL) {

        avatar.innerHTML = "";


        const image =
            document.createElement(
                "img"
            );


        image.src =
            avatarURL;


        image.alt =
            "Profile";


        image.loading =
            "lazy";


        image.onerror =
            () => {

                avatar.innerHTML =
                    `<span>${getInitials(name)}</span>`;
            };


        avatar.appendChild(
            image
        );

    }

    else {

        avatar.innerHTML =
            `<span>${getInitials(name)}</span>`;
    }

}


/* =========================================================
   DEMO PROFILE
========================================================= */

function useDemoProfile() {

    log(
        "Using demo child profile."
    );


    currentProfile = {

        id:
            "demo-child",

        full_name:
            "Yashini",

        email:
            "yashini@example.com",

        role:
            "child",

        avatar_url:
            null
    };


    currentUser = {

        id:
            "demo-child",

        email:
            "yashini@example.com"
    };


    updateUserUI(
        currentProfile
    );

}


/* =========================================================
   GET INITIALS
========================================================= */

function getInitials(name) {

    if (!name) {

        return "?";
    }


    return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(
            word =>
                word
                    .charAt(0)
                    .toUpperCase()
        )
        .join("");

}


/* =========================================================
   CURRENT DATE
========================================================= */

function setCurrentDate() {

    const date =
        new Date();


    const options = {

        weekday:
            "long",

        month:
            "short",

        day:
            "numeric",

        year:
            "numeric"
    };


    const element =
        document.getElementById(
            "currentDate"
        );


    if (element) {

        element.textContent =
            date.toLocaleDateString(
                "en-IN",
                options
            );
    }

}


/* =========================================================
   MOBILE MENU
========================================================= */

function initializeMobileMenu() {

    const button =
        document.getElementById(
            "mobileMenu"
        );


    const sidebar =
        document.getElementById(
            "sidebar"
        );


    if (!button || !sidebar) {

        return;
    }


    button.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            sidebar.classList.toggle(
                "open"
            );
        }
    );


    /*
       Close sidebar when clicking outside.
    */

    document.addEventListener(
        "click",
        event => {

            if (
                window.innerWidth > 800
            ) {

                return;
            }


            if (
                !sidebar.contains(event.target) &&
                !button.contains(event.target)
            ) {

                sidebar.classList.remove(
                    "open"
                );
            }
        }
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

function initializeNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(
        item => {

            item.addEventListener(
                "click",
                event => {

                    event.preventDefault();


                    navItems.forEach(
                        nav => {

                            nav.classList.remove(
                                "active"
                            );
                        }
                    );


                    item.classList.add(
                        "active"
                    );


                    const text =
                        item
                            .querySelector("span")
                            ?.textContent
                            ?.trim();


                    handleNavigation(
                        text
                    );


                    const sidebar =
                        document.getElementById(
                            "sidebar"
                        );


                    if (
                        sidebar &&
                        window.innerWidth <= 800
                    ) {

                        sidebar.classList.remove(
                            "open"
                        );
                    }

                }
            );

        }
    );

}


/* =========================================================
   NAVIGATION HANDLER
========================================================= */

function handleNavigation(
    section
) {

    if (!section) {

        return;
    }


    log(
        "Navigation:",
        section
    );


    switch (section) {

        case "Dashboard":

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

            break;


        case "Therapy Sessions":

            showMessage(
                "Therapy Sessions will open here.",
                "info"
            );

            break;


        case "Activities":

            scrollToSection(
                ".activities-grid"
            );

            break;


        case "My Progress":

            scrollToSection(
                ".progress-card-body"
            );

            break;


        case "My Therapist":

            scrollToSection(
                ".therapist-body"
            );

            break;


        case "Messages":

            showMessage(
                "Messaging module coming next.",
                "info"
            );

            break;


        case "Notifications":

            openNotifications();

            break;


        case "Settings":

            showMessage(
                "Settings module coming next.",
                "info"
            );

            break;


        default:

            break;
    }

}


/* =========================================================
   SCROLL TO SECTION
========================================================= */

function scrollToSection(
    selector
) {

    const element =
        document.querySelector(
            selector
        );


    if (!element) {

        return;
    }


    element.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


/* =========================================================
   LOGOUT
========================================================= */

async function logout() {

    log(
        "Logging out..."
    );


    const button =
        document.getElementById(
            "logoutButton"
        );


    if (button) {

        button.disabled =
            true;

        button.innerHTML =
            `<i class="fa-solid fa-spinner fa-spin"></i>
             <span>Signing out...</span>`;
    }


    try {

        if (supabaseClient) {

            const {
                error
            } =
                await supabaseClient.auth.signOut();


            if (error) {

                throw error;
            }
        }


        /*
           Remove any locally stored dashboard
           information.
        */

        localStorage.removeItem(
            "kidora_user"
        );


        sessionStorage.removeItem(
            "kidora_user"
        );


        window.location.href =
            KIDORA_CONFIG.LOGIN_PAGE;

    }

    catch (error) {

        logError(
            "Logout failed:",
            error
        );


        if (button) {

            button.disabled =
                false;

            button.innerHTML =
                `<i class="fa-solid fa-right-from-bracket"></i>
                 <span>Sign Out</span>`;
        }


        showMessage(
            "Unable to sign out. Please try again.",
            "error"
        );
    }

}


/* =========================================================
   INITIALIZE LOGOUT
========================================================= */

function initializeLogout() {

    const button =
        document.getElementById(
            "logoutButton"
        );


    if (!button) {

        return;
    }


    button.addEventListener(
        "click",
        logout
    );

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function initializeNotifications() {

    const buttons =
        document.querySelectorAll(
            ".topbar-right .icon-btn"
        );


    if (!buttons.length) {

        return;
    }


    /*
       First button = notifications
    */

    const notificationButton =
        buttons[0];


    notificationButton.addEventListener(
        "click",
        openNotifications
    );


    /*
       Second button = help
    */

    if (buttons[1]) {

        buttons[1].addEventListener(
            "click",
            () => {

                showMessage(
                    "Need help? Your therapist can assist you.",
                    "info"
                );

            }
        );
    }

}


/* =========================================================
   OPEN NOTIFICATIONS
========================================================= */

function openNotifications() {

    log(
        "Opening notifications..."
    );


    showMessage(
        "Notifications panel will be available here.",
        "info"
    );

}


/* =========================================================
   THERAPIST CONTACT
========================================================= */

function initializeTherapistButton() {

    const button =
        document.querySelector(
            ".contact-btn"
        );


    if (!button) {

        return;
    }


    button.addEventListener(
        "click",
        () => {

            log(
                "Contact therapist clicked."
            );


            showMessage(
                "Messaging with your therapist will open here.",
                "info"
            );
        }
    );

}


/* =========================================================
   ACTIVITY BUTTONS
========================================================= */

function initializeActivities() {

    const buttons =
        document.querySelectorAll(
            ".activity-btn"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const activity =
                        button
                            .closest(".activity");


                    if (!activity) {

                        return;
                    }


                    const title =
                        activity
                            .querySelector("h3")
                            ?.textContent
                            ?.trim();


                    const status =
                        activity
                            .querySelector(".status");


                    if (
                        button.textContent
                            .trim()
                            .toLowerCase()
                            .includes("start")
                    ) {

                        startActivity(
                            title,
                            button,
                            status
                        );

                    }

                    else {

                        showMessage(
                            `${title} review opened.`,
                            "info"
                        );
                    }

                }
            );

        }
    );

}


/* =========================================================
   START ACTIVITY
========================================================= */

async function startActivity(
    title,
    button,
    status
) {

    log(
        "Starting activity:",
        title
    );


    button.disabled =
        true;


    button.textContent =
        "Starting...";


    /*
       Demo delay.
    */

    await wait(
        500
    );


    if (status) {

        status.textContent =
            "In Progress";


        status.classList.remove(
            "pending"
        );


        status.classList.add(
            "done"
        );
    }


    button.disabled =
        false;


    button.textContent =
        "Continue";


    showMessage(
        `${title} started.`,
        "success"
    );

}


/* =========================================================
   WAIT HELPER
========================================================= */

function wait(
    milliseconds
) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );

}


/* =========================================================
   LOAD DASHBOARD DATA
========================================================= */

async function loadDashboardData() {

    /*
       Your current HTML contains demo values.

       This function is prepared for Supabase data.

       We intentionally don't overwrite the existing
       dashboard values unless the corresponding
       tables actually exist.
    */

    if (!supabaseClient) {

        return;
    }


    if (!currentUser) {

        return;
    }


    log(
        "Loading dashboard data..."
    );


    await Promise.allSettled([

        loadTherapyStats(),

        loadActivities(),

        loadGoals(),

        loadRecentActivity()

    ]);

}


/* =========================================================
   LOAD THERAPY STATS
========================================================= */

async function loadTherapyStats() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    KIDORA_CONFIG.TABLES.THERAPY_SESSIONS
                )
                .select("*")
                .eq(
                    "child_id",
                    currentUser.id
                );


        if (error) {

            /*
               Table may not exist yet.
            */

            log(
                "Therapy stats unavailable:",
                error.message
            );

            return;
        }


        if (!data) {

            return;
        }


        const totalSessions =
            data.length;


        /*
           Find first stat card.
        */

        const cards =
            document.querySelectorAll(
                ".stat-card"
            );


        if (
            cards[0] &&
            totalSessions >= 0
        ) {

            const value =
                cards[0]
                    .querySelector(
                        ".stat-value"
                    );


            if (value) {

                value.textContent =
                    totalSessions;
            }
        }

    }

    catch (error) {

        logError(
            "Therapy stats error:",
            error
        );
    }

}


/* =========================================================
   LOAD ACTIVITIES
========================================================= */

async function loadActivities() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    KIDORA_CONFIG.TABLES.ACTIVITIES
                )
                .select("*")
                .eq(
                    "child_id",
                    currentUser.id
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            log(
                "Activities unavailable:",
                error.message
            );

            return;
        }


        if (!data) {

            return;
        }


        log(
            "Activities loaded:",
            data.length
        );


        /*
           The HTML currently contains three
           static activity cards.

           When your activities table is ready,
           this is where dynamic rendering can be added.
        */

    }

    catch (error) {

        logError(
            "Activities error:",
            error
        );
    }

}


/* =========================================================
   LOAD GOALS
========================================================= */

async function loadGoals() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    KIDORA_CONFIG.TABLES.GOALS
                )
                .select("*")
                .eq(
                    "child_id",
                    currentUser.id
                );


        if (error) {

            log(
                "Goals unavailable:",
                error.message
            );

            return;
        }


        if (!data) {

            return;
        }


        log(
            "Goals loaded:",
            data.length
        );

    }

    catch (error) {

        logError(
            "Goals error:",
            error
        );
    }

}


/* =========================================================
   LOAD RECENT ACTIVITY
========================================================= */

async function loadRecentActivity() {

    try {

        /*
           If you create a dedicated activity log table,
           replace this with that table.

           For now, we don't overwrite the demo timeline.
        */

        log(
            "Recent activity initialized."
        );

    }

    catch (error) {

        logError(
            "Recent activity error:",
            error
        );
    }

}


/* =========================================================
   REALTIME PROFILE
========================================================= */

function initializeRealtime() {

    if (!supabaseClient) {

        return;
    }


    if (!currentUser) {

        return;
    }


    log(
        "Starting profile realtime..."
    );


    try {

        realtimeChannel =
            supabaseClient
                .channel(
                    `kidora-child-${currentUser.id}`
                )
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table:
                            KIDORA_CONFIG.TABLES.PROFILES,
                        filter:
                            `id=eq.${currentUser.id}`
                    },
                    payload => {

                        log(
                            "Profile realtime update:",
                            payload
                        );


                        if (
                            payload.new
                        ) {

                            currentProfile =
                                payload.new;


                            updateUserUI(
                                currentProfile
                            );
                        }

                    }
                )
                .subscribe(
                    status => {

                        log(
                            "Realtime status:",
                            status
                        );
                    }
                );

    }

    catch (error) {

        logError(
            "Realtime initialization failed:",
            error
        );
    }

}


/* =========================================================
   AUTH STATE LISTENER
========================================================= */

function initializeAuthListener() {

    if (!supabaseClient) {

        return;
    }


    supabaseClient.auth.onAuthStateChange(
        (event, session) => {

            log(
                "Auth event:",
                event
            );


            if (
                event === "SIGNED_OUT"
            ) {

                window.location.href =
                    KIDORA_CONFIG.LOGIN_PAGE;

                return;
            }


            if (
                event === "SIGNED_IN" &&
                session?.user
            ) {

                currentUser =
                    session.user;
            }


            if (
                event === "TOKEN_REFRESHED" &&
                session?.user
            ) {

                currentUser =
                    session.user;
            }

        }
    );

}


/* =========================================================
   SHOW MESSAGE
========================================================= */

function showMessage(
    message,
    type = "info"
) {

    log(
        `${type.toUpperCase()}:`,
        message
    );


    const element =
        document.getElementById(
            "authMessage"
        );


    /*
       Your dashboard doesn't currently have
       an authMessage element.

       If one exists, use it.
    */

    if (element) {

        element.textContent =
            message;


        element.className =
            `auth-message ${type}`;


        return;
    }


    /*
       Create a small temporary notification.
    */

    let toast =
        document.getElementById(
            "kidoraToast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );


        toast.id =
            "kidoraToast";


        toast.style.position =
            "fixed";


        toast.style.right =
            "24px";


        toast.style.bottom =
            "24px";


        toast.style.zIndex =
            "9999";


        toast.style.maxWidth =
            "360px";


        toast.style.padding =
            "13px 17px";


        toast.style.borderRadius =
            "12px";


        toast.style.background =
            "#111827";


        toast.style.color =
            "#ffffff";


        toast.style.fontSize =
            "13px";


        toast.style.fontWeight =
            "600";


        toast.style.boxShadow =
            "0 10px 30px rgba(0,0,0,.15)";


        toast.style.opacity =
            "0";


        toast.style.transform =
            "translateY(10px)";


        toast.style.transition =
            "all .25s ease";


        document.body.appendChild(
            toast
        );
    }


    toast.textContent =
        message;


    requestAnimationFrame(
        () => {

            toast.style.opacity =
                "1";

            toast.style.transform =
                "translateY(0)";
        }
    );


    clearTimeout(
        toast._timeout
    );


    toast._timeout =
        setTimeout(
            () => {

                toast.style.opacity =
                    "0";

                toast.style.transform =
                    "translateY(10px)";

            },
            3000
        );

}


/* =========================================================
   LOADING SCREEN
========================================================= */

function hideLoadingScreen() {

    const loading =
        document.getElementById(
            "loadingOverlay"
        );


    if (!loading) {

        return;
    }


    loading.classList.add(
        "hidden"
    );

}


/* =========================================================
   PREVENT BROKEN LINKS
========================================================= */

function initializeStaticLinks() {

    const links =
        document.querySelectorAll(
            'a[href="#"]'
        );


    links.forEach(
        link => {

            link.addEventListener(
                "click",
                event => {

                    event.preventDefault();
                }
            );
        }
    );

}


/* =========================================================
   CLEANUP
========================================================= */

async function cleanupRealtime() {

    if (
        supabaseClient &&
        realtimeChannel
    ) {

        try {

            await supabaseClient
                .removeChannel(
                    realtimeChannel
                );

        }

        catch (error) {

            logError(
                "Realtime cleanup error:",
                error
            );
        }

        realtimeChannel =
            null;
    }

}


/* =========================================================
   PAGE EXIT
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        cleanupRealtime();
    }
);


/* =========================================================
   MAIN INITIALIZATION
========================================================= */

async function initializeDashboard() {

    log(
        "======================================"
    );

    log(
        "KIDORA CHILD DASHBOARD"
    );

    log(
        "Initializing dashboard..."
    );


    try {

        /*
           1. Initialize Supabase
        */

        const supabaseReady =
            initializeSupabase();


        /*
           2. Date
        */

        setCurrentDate();


        /*
           3. UI
        */

        initializeMobileMenu();

        initializeNavigation();

        initializeLogout();

        initializeNotifications();

        initializeTherapistButton();

        initializeActivities();

        initializeStaticLinks();


        /*
           4. Authentication
        */

        if (supabaseReady) {

            const authenticated =
                await checkAuthentication();


            if (!authenticated) {

                hideLoadingScreen();

                return;
            }


            /*
               5. Auth listener
            */

            initializeAuthListener();


            /*
               6. Load profile
            */

            await loadUserProfile();


            /*
               7. Dashboard data
            */

            await loadDashboardData();


            /*
               8. Realtime
            */

            initializeRealtime();

        }

        else {

            /*
               Supabase isn't configured.

               Only allow demo mode if explicitly
               enabled.
            */

            if (
                KIDORA_CONFIG.DEMO_MODE
            ) {

                useDemoProfile();

            }

            else {

                showMessage(
                    "Supabase is not configured. Please add your anon key.",
                    "error"
                );
            }
        }


        /*
           9. Hide loading screen
        */

        setTimeout(
            hideLoadingScreen,
            300
        );


        log(
            "KIDORA child dashboard ready."
        );


        log(
            "======================================"
        );

    }

    catch (error) {

        logError(
            "Dashboard initialization failed:",
            error
        );


        showMessage(
            "Something went wrong while loading the dashboard.",
            "error"
        );


        hideLoadingScreen();
    }

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeDashboard
);