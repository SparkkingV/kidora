/* =========================================================
   KIDORA THERAPIST DASHBOARD
========================================================= */

console.log("======================================");
console.log("KIDORA therapist dashboard loaded");
console.log("======================================");


/* =========================================================
   SUPABASE CONFIG
========================================================= */

/*
   IMPORTANT:

   Replace these with your actual Supabase project values.

   Project URL:
   https://YOUR_PROJECT.supabase.co

   Anon key:
   Your Supabase anon/public key

   DO NOT put a service_role key here.
*/

const SUPABASE_URL =
    "https://vvaxscrxalmroycyarnk.supabase.co";

const SUPABASE_ANON_KEY =
    "YOUR_SUPABASE_ANON_KEY";


let supabaseClient = null;


/* =========================================================
   INITIALIZE SUPABASE
========================================================= */

function initializeSupabase() {

    try {

        if (
            SUPABASE_ANON_KEY &&
            SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY"
        ) {

            supabaseClient =
                window.supabase.createClient(
                    SUPABASE_URL,
                    SUPABASE_ANON_KEY
                );

            console.log(
                "KIDORA: Supabase connected."
            );

        } else {

            console.warn(
                "KIDORA: Supabase anon key not configured. Demo mode enabled."
            );

        }

    } catch (error) {

        console.error(
            "KIDORA: Supabase initialization failed:",
            error
        );

    }

}


/* =========================================================
   DEMO MODE
========================================================= */

const DEMO_MODE =
    !SUPABASE_ANON_KEY ||
    SUPABASE_ANON_KEY === "YOUR_SUPABASE_ANON_KEY";


/* =========================================================
   DEMO DATA
========================================================= */

const demoTherapist = {

    id: "therapist-demo",

    full_name: "Dr. Ananya Kumar",

    email: "therapist@kidora.app",

    role: "therapist"

};


const demoChildren = [

    {
        id: "KID-1001",
        full_name: "Aarav Sharma",
        age: 9,
        status: "active",
        last_session: "Today, 10:30 AM",
        progress: 84,
        sessions: 18
    },

    {
        id: "KID-1002",
        full_name: "Diya Krishnan",
        age: 8,
        status: "attention",
        last_session: "Yesterday, 3:00 PM",
        progress: 62,
        sessions: 14
    },

    {
        id: "KID-1003",
        full_name: "Rohan Patel",
        age: 10,
        status: "active",
        last_session: "Today, 9:00 AM",
        progress: 78,
        sessions: 21
    },

    {
        id: "KID-1004",
        full_name: "Meera Nair",
        age: 7,
        status: "active",
        last_session: "18 Aug, 11:00 AM",
        progress: 91,
        sessions: 24
    },

    {
        id: "KID-1005",
        full_name: "Arjun Menon",
        age: 11,
        status: "inactive",
        last_session: "12 Aug, 2:00 PM",
        progress: 55,
        sessions: 9
    },

    {
        id: "KID-1006",
        full_name: "Sara Thomas",
        age: 8,
        status: "active",
        last_session: "Today, 11:30 AM",
        progress: 73,
        sessions: 16
    }

];


const demoSessions = [

    {
        id: "SES-001",
        child: "Aarav Sharma",
        title: "Motor Skills Training",
        date: "Today, 10:30 AM",
        duration: "42 min",
        score: "88%",
        notes:
            "Good improvement in balance and hand coordination."
    },

    {
        id: "SES-002",
        child: "Rohan Patel",
        title: "Cognitive Exercise",
        date: "Today, 9:00 AM",
        duration: "35 min",
        score: "81%",
        notes:
            "Completed memory exercises with minimal assistance."
    },

    {
        id: "SES-003",
        child: "Diya Krishnan",
        title: "Fine Motor Therapy",
        date: "Yesterday, 3:00 PM",
        duration: "38 min",
        score: "64%",
        notes:
            "Requires additional support during precision tasks."
    },

    {
        id: "SES-004",
        child: "Meera Nair",
        title: "Coordination Training",
        date: "18 Aug, 11:00 AM",
        duration: "45 min",
        score: "94%",
        notes:
            "Excellent performance across all exercises."
    }

];


const demoAlerts = [

    {
        id: "ALT-001",
        type: "warning",
        child: "Diya Krishnan",
        title: "Progress needs attention",
        message:
            "Recent therapy scores have decreased.",
        time:
            "25 minutes ago"
    },

    {
        id: "ALT-002",
        type: "danger",
        child: "Arjun Menon",
        title: "Missed therapy session",
        message:
            "Scheduled session was not completed.",
        time:
            "2 hours ago"
    },

    {
        id: "ALT-003",
        type: "info",
        child: "Aarav Sharma",
        title: "New milestone achieved",
        message:
            "Aarav reached 80% progress.",
        time:
            "Yesterday"
    }

];


/* =========================================================
   APPLICATION STATE
========================================================= */

const state = {

    therapist:
        demoTherapist,

    children:
        [...demoChildren],

    sessions:
        [...demoSessions],

    alerts:
        [...demoAlerts],

    filteredChildren:
        [...demoChildren],

    chart:
        null

};


/* =========================================================
   DOM
========================================================= */

const $ =
    selector =>
        document.querySelector(selector);

const $$ =
    selector =>
        document.querySelectorAll(selector);


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeDashboard
);


async function initializeDashboard() {

    console.log(
        "KIDORA therapist dashboard initializing..."
    );


    initializeSupabase();


    await loadTherapist();


    renderTherapist();


    renderStatistics();


    renderChildren();


    renderSessions();


    renderAlerts();


    renderProgressCards();


    initializeChart();


    setupNavigation();


    setupSearch();


    setupModals();


    setupSettings();


    setupLogout();


    console.log(
        "KIDORA therapist dashboard initialized."
    );

}


/* =========================================================
   LOAD THERAPIST
========================================================= */

async function loadTherapist() {

    if (
        DEMO_MODE ||
        !supabaseClient
    ) {

        return;

    }


    try {

        const {
            data: {
                user
            },
            error
        } =
            await supabaseClient
                .auth
                .getUser();


        if (error)
            throw error;


        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        const {
            data: profile,
            error: profileError
        } =
            await supabaseClient
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();


        if (profileError)
            throw profileError;


        if (
            profile &&
            profile.role !== "therapist"
        ) {

            alert(
                "This dashboard is only available to therapists."
            );

            window.location.href =
                "child-dashboard.html";

            return;

        }


        state.therapist =
            profile || {

                id: user.id,

                full_name:
                    user.user_metadata?.full_name ||
                    "Therapist",

                email:
                    user.email,

                role:
                    "therapist"

            };


    } catch (error) {

        console.error(
            "Failed to load therapist:",
            error
        );

    }

}


/* =========================================================
   RENDER THERAPIST
========================================================= */

function renderTherapist() {

    const therapist =
        state.therapist;


    const name =
        therapist.full_name ||
        "Therapist";


    const initials =
        getInitials(name);


    $("#sidebarName").textContent =
        name;

    $("#topName").textContent =
        name;


    $("#sidebarAvatar").textContent =
        initials;

    $("#topAvatar").textContent =
        initials;


    const hour =
        new Date().getHours();


    let greeting =
        "Good evening";


    if (hour < 12)
        greeting = "Good morning";

    else if (hour < 17)
        greeting = "Good afternoon";


    $("#welcomeTitle").textContent =
        `${greeting}, ${name.split(" ")[0]}`;
}


/* =========================================================
   INITIALS
========================================================= */

function getInitials(name) {

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
            word =>
                word[0]
                    .toUpperCase()
        )
        .join("");

}


/* =========================================================
   STATISTICS
========================================================= */

function renderStatistics() {

    const children =
        state.children;


    const active =
        children.filter(
            child =>
                child.status === "active"
        ).length;


    const alerts =
        state.alerts.length;


    const average =
        children.length
            ? Math.round(
                children.reduce(
                    (sum, child) =>
                        sum + child.progress,
                    0
                ) / children.length
            )
            : 0;


    $("#totalChildren")
        .textContent =
        children.length;


    $("#childrenNavBadge")
        .textContent =
        children.length;


    $("#activeSessions")
        .textContent =
        active;


    $("#pendingAlerts")
        .textContent =
        alerts;


    $("#alertsNavBadge")
        .textContent =
        alerts;


    $("#averageProgress")
        .textContent =
        average;


    $("#childrenGrowth")
        .textContent =
        "12%";


    $("#notificationDot")
        .style.display =
        alerts > 0
            ? "block"
            : "none";

}


/* =========================================================
   CHILDREN TABLE
========================================================= */

function renderChildren() {

    const table =
        $("#childrenTable");


    table.innerHTML = "";


    state.filteredChildren
        .forEach(child => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>

                    <div class="child-cell">

                        <div class="avatar">
                            ${getInitials(child.full_name)}
                        </div>

                        <div>

                            <strong>
                                ${escapeHTML(child.full_name)}
                            </strong>

                            <span>
                                ${child.age} years • ${child.id}
                            </span>

                        </div>

                    </div>

                </td>


                <td>

                    <span class="status ${child.status}">
                        ${formatStatus(child.status)}
                    </span>

                </td>


                <td>
                    ${child.last_session}
                </td>


                <td>

                    <div class="progress-mini">

                        <span
                            style="width:${child.progress}%">
                        </span>

                    </div>

                    ${child.progress}%

                </td>


                <td>
                    ${child.sessions}
                </td>


                <td>

                    <button
                        class="action-button"
                        data-child="${child.id}"
                        aria-label="View child">

                        <i class="fa-solid fa-arrow-right"></i>

                    </button>

                </td>

            `;


            table.appendChild(row);

        });


    $$("#childrenTable .action-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    openChildModal(
                        button.dataset.child
                    )
            );

        });

}


/* =========================================================
   STATUS
========================================================= */

function formatStatus(status) {

    if (status === "attention")
        return "Needs Attention";

    if (status === "inactive")
        return "Inactive";

    return "Active";

}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

    $("#childSearch")
        .addEventListener(
            "input",
            filterChildren
        );


    $("#statusFilter")
        .addEventListener(
            "change",
            filterChildren
        );


    $("#globalSearch")
        .addEventListener(
            "input",
            globalSearch
        );


    $("#globalSearchButton")
        .addEventListener(
            "click",
            () => {

                $("#searchPanel")
                    .classList
                    .add("visible");

                $("#globalSearch")
                    .focus();

            }
        );


    $("#closeSearch")
        .addEventListener(
            "click",
            () => {

                $("#searchPanel")
                    .classList
                    .remove("visible");

            }
        );

}


function filterChildren() {

    const query =
        $("#childSearch")
            .value
            .toLowerCase()
            .trim();


    const status =
        $("#statusFilter")
            .value;


    state.filteredChildren =
        state.children.filter(
            child => {

                const matchesQuery =
                    child.full_name
                        .toLowerCase()
                        .includes(query);


                const matchesStatus =
                    status === "all" ||
                    child.status === status;


                return (
                    matchesQuery &&
                    matchesStatus
                );

            }
        );


    renderChildren();

}


/* =========================================================
   GLOBAL SEARCH
========================================================= */

function globalSearch() {

    const query =
        $("#globalSearch")
            .value
            .toLowerCase()
            .trim();


    if (!query)
        return;


    const child =
        state.children.find(
            item =>
                item.full_name
                    .toLowerCase()
                    .includes(query)
        );


    if (child) {

        document
            .getElementById("children")
            .scrollIntoView({
                behavior: "smooth"
            });

        $("#childSearch")
            .value =
            query;

        filterChildren();

    }

}


/* =========================================================
   SESSIONS
========================================================= */

function renderSessions() {

    const container =
        $("#sessionsGrid");


    container.innerHTML = "";


    state.sessions
        .forEach(session => {

            const card =
                document.createElement("article");


            card.className =
                "session-card";


            card.innerHTML = `

                <div class="session-top">

                    <span class="status active">
                        Completed
                    </span>

                    <span class="session-date">
                        ${session.date}
                    </span>

                </div>


                <h3>
                    ${escapeHTML(session.title)}
                </h3>


                <p>
                    ${escapeHTML(session.child)}
                </p>


                <div class="session-meta">

                    <div>

                        <span>
                            Duration
                        </span>

                        <strong>
                            ${session.duration}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Score
                        </span>

                        <strong>
                            ${session.score}
                        </strong>

                    </div>

                </div>

            `;


            card.addEventListener(
                "click",
                () =>
                    openSessionModal(session)
            );


            container.appendChild(card);

        });

}


/* =========================================================
   ALERTS
========================================================= */

function renderAlerts() {

    renderDashboardAlerts();

    renderFullAlerts();

}


function renderDashboardAlerts() {

    const container =
        $("#dashboardAlerts");


    container.innerHTML = "";


    state.alerts
        .slice(0, 4)
        .forEach(alert => {

            const item =
                document.createElement("div");


            item.className =
                "alert-item";


            item.innerHTML = `

                <div class="alert-icon ${alert.type}">

                    <i class="fa-solid
                        ${getAlertIcon(alert.type)}">
                    </i>

                </div>


                <div class="alert-content">

                    <strong>
                        ${escapeHTML(alert.title)}
                    </strong>

                    <p>
                        ${escapeHTML(alert.message)}
                    </p>

                    <time>
                        ${alert.time}
                    </time>

                </div>

            `;


            container.appendChild(item);

        });

}


function renderFullAlerts() {

    const container =
        $("#fullAlertList");


    container.innerHTML = "";


    state.alerts
        .forEach(alert => {

            const item =
                document.createElement("div");


            item.className =
                "full-alert";


            item.innerHTML = `

                <div class="alert-icon ${alert.type}">

                    <i class="fa-solid
                        ${getAlertIcon(alert.type)}">
                    </i>

                </div>


                <div class="alert-content">

                    <strong>
                        ${escapeHTML(alert.title)}
                    </strong>

                    <p>
                        ${escapeHTML(alert.child)}
                        — ${escapeHTML(alert.message)}
                    </p>

                    <time>
                        ${alert.time}
                    </time>

                </div>


                <button
                    onclick="handleAlert('${alert.id}')">

                    Review

                </button>

            `;


            container.appendChild(item);

        });

}


function getAlertIcon(type) {

    if (type === "danger")
        return "fa-triangle-exclamation";

    if (type === "warning")
        return "fa-circle-exclamation";

    return "fa-circle-info";

}


function handleAlert(id) {

    const alert =
        state.alerts.find(
            item =>
                item.id === id
        );


    if (!alert)
        return;


    const child =
        state.children.find(
            item =>
                item.full_name ===
                alert.child
        );


    if (child)
        openChildModal(child.id);

}


/* =========================================================
   PROGRESS CARDS
========================================================= */

function renderProgressCards() {

    const container =
        $("#childProgressGrid");


    container.innerHTML = "";


    state.children
        .slice(0, 6)
        .forEach(child => {

            const card =
                document.createElement("article");


            card.className =
                "progress-card";


            card.innerHTML = `

                <div class="progress-card-header">

                    <div class="avatar">
                        ${getInitials(child.full_name)}
                    </div>

                    <div>

                        <h3>
                            ${escapeHTML(child.full_name)}
                        </h3>

                        <span>
                            ${child.sessions} sessions
                        </span>

                    </div>

                </div>


                <div
                    class="circular-progress"
                    style="--progress:${child.progress}">

                    <strong>
                        ${child.progress}%
                    </strong>

                </div>


                <div class="progress-card-footer">

                    <span>
                        Overall Progress
                    </span>

                    <span class="positive">
                        ${getProgressLabel(child.progress)}
                    </span>

                </div>

            `;


            container.appendChild(card);

        });

}


function getProgressLabel(progress) {

    if (progress >= 85)
        return "Excellent";

    if (progress >= 70)
        return "Good";

    if (progress >= 55)
        return "Developing";

    return "Needs Support";

}


/* =========================================================
   CHART
========================================================= */

function initializeChart() {

    const canvas =
        $("#progressChart");


    if (!canvas)
        return;


    const context =
        canvas.getContext("2d");


    state.chart =
        new Chart(
            context,
            {

                type: "line",

                data: {

                    labels: [
                        "1",
                        "5",
                        "10",
                        "15",
                        "20",
                        "25",
                        "30"
                    ],

                    datasets: [

                        {
                            label:
                                "Average Progress",

                            data: [
                                55,
                                59,
                                61,
                                65,
                                69,
                                73,
                                78
                            ],

                            borderColor:
                                "#5b5ce2",

                            backgroundColor:
                                "rgba(91,92,226,.08)",

                            borderWidth: 2,

                            fill: true,

                            tension: .4,

                            pointRadius: 3,

                            pointHoverRadius: 5

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        y: {

                            min: 0,

                            max: 100,

                            ticks: {
                                font: {
                                    size: 9
                                }
                            },

                            grid: {
                                color:
                                    "#edf0f5"
                            }

                        },

                        x: {

                            ticks: {
                                font: {
                                    size: 9
                                }
                            },

                            grid: {
                                display: false
                            }

                        }

                    }

                }

            }
        );


    $("#progressRange")
        .addEventListener(
            "change",
            updateChartRange
        );

}


function updateChartRange(event) {

    if (!state.chart)
        return;


    const range =
        event.target.value;


    let labels;
    let data;


    if (range === "7") {

        labels = [
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
            "Sun"
        ];

        data = [
            69,
            71,
            70,
            74,
            76,
            77,
            78
        ];

    } else if (range === "90") {

        labels = [
            "May",
            "Jun",
            "Jul",
            "Aug"
        ];

        data = [
            52,
            61,
            69,
            78
        ];

    } else {

        labels = [
            "1",
            "5",
            "10",
            "15",
            "20",
            "25",
            "30"
        ];

        data = [
            55,
            59,
            61,
            65,
            69,
            73,
            78
        ];

    }


    state.chart.data.labels =
        labels;


    state.chart.data.datasets[0].data =
        data;


    state.chart.update();

}


/* =========================================================
   CHILD MODAL
========================================================= */

function openChildModal(id) {

    const child =
        state.children.find(
            item =>
                item.id === id
        );


    if (!child)
        return;


    $("#modalChildAvatar")
        .textContent =
        getInitials(
            child.full_name
        );


    $("#modalChildName")
        .textContent =
        child.full_name;


    $("#modalChildId")
        .textContent =
        `KIDORA ID: ${child.id}`;


    $("#modalProgress")
        .textContent =
        `${child.progress}%`;


    $("#modalSessions")
        .textContent =
        child.sessions;


    $("#modalStatus")
        .textContent =
        formatStatus(
            child.status
        );


    $("#modalActivity")
        .innerHTML = `

        <p>
            Last therapy session:
            <strong>
                ${child.last_session}
            </strong>
        </p>

        <p>
            Current progress:
            <strong>
                ${getProgressLabel(child.progress)}
            </strong>
        </p>

        <p>
            The child's therapy performance is being
            monitored through KIDORA.
        </p>

    `;


    openModal(
        $("#childModal")
    );

}


/* =========================================================
   SESSION MODAL
========================================================= */

function openSessionModal(session) {

    $("#modalSessionTitle")
        .textContent =
        session.title;


    $("#modalSessionDate")
        .textContent =
        session.date;


    $("#modalSessionChild")
        .textContent =
        session.child;


    $("#modalSessionDuration")
        .textContent =
        session.duration;


    $("#modalSessionScore")
        .textContent =
        session.score;


    $("#modalSessionNotes")
        .textContent =
        session.notes;


    openModal(
        $("#sessionModal")
    );

}


/* =========================================================
   MODAL MANAGEMENT
========================================================= */

function setupModals() {

    $$("[data-close-modal]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    closeAllModals();

                }
            );

        });


    $$(".modal-overlay")
        .forEach(overlay => {

            overlay.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        overlay
                    ) {

                        closeAllModals();

                    }

                }
            );

        });


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeAllModals();

            }

        }
    );

}


function openModal(modal) {

    modal.classList.add(
        "visible"
    );

    document.body.style.overflow =
        "hidden";

}


function closeAllModals() {

    $$(".modal-overlay")
        .forEach(modal => {

            modal.classList.remove(
                "visible"
            );

        });


    document.body.style.overflow =
        "";

}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    $$(".nav-item")
        .forEach(item => {

            item.addEventListener(
                "click",
                () => {

                    $$(".nav-item")
                        .forEach(nav =>
                            nav.classList.remove(
                                "active"
                            )
                        );


                    item.classList.add(
                        "active"
                    );


                    $("#sidebar")
                        .classList
                        .remove("open");

                }
            );

        });


    $("#mobileMenu")
        .addEventListener(
            "click",
            () => {

                $("#sidebar")
                    .classList
                    .toggle("open");

            }
        );

}


/* =========================================================
   SCROLL SECTION
========================================================= */

function scrollToSection(id) {

    const element =
        document.getElementById(id);


    if (element) {

        element.scrollIntoView({
            behavior: "smooth"
        });

    }

}


window.scrollToSection =
    scrollToSection;


/* =========================================================
   SETTINGS
========================================================= */

function setupSettings() {

    const toggle =
        $("#darkModeToggle");


    const saved =
        localStorage.getItem(
            "kidora-dark-mode"
        );


    if (saved === "true") {

        document.body
            .classList
            .add("dark");

        toggle.checked = true;

    }


    toggle.addEventListener(
        "change",
        () => {

            document.body
                .classList
                .toggle(
                    "dark",
                    toggle.checked
                );


            localStorage.setItem(
                "kidora-dark-mode",
                toggle.checked
            );

        }
    );

}


/* =========================================================
   LOGOUT
========================================================= */

function setupLogout() {

    $("#logoutButton")
        .addEventListener(
            "click",
            logout
        );

}


async function logout() {

    try {

        if (
            supabaseClient &&
            !DEMO_MODE
        ) {

            await supabaseClient
                .auth
                .signOut();

        }

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }


    window.location.href =
        "login.html";

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   SUPABASE DATA FUNCTIONS
========================================================= */

/*
   These functions are intentionally separated from
   the UI.

   Once the database is ready, we replace the demo
   data with these queries.
*/


async function loadChildrenFromSupabase() {

    if (
        !supabaseClient
    )
        return;


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("profiles")
                .select(
                    "id, full_name, email, role"
                )
                .eq(
                    "role",
                    "child"
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error)
            throw error;


        state.children =
            data.map(
                child => ({

                    id:
                        child.id,

                    full_name:
                        child.full_name,

                    age:
                        "--",

                    status:
                        "active",

                    last_session:
                        "No sessions",

                    progress:
                        0,

                    sessions:
                        0

                })
            );


        state.filteredChildren =
            [...state.children];


        renderStatistics();

        renderChildren();

        renderProgressCards();


    } catch (error) {

        console.error(
            "Failed to load children:",
            error
        );

    }

}


/* =========================================================
   REALTIME SUPPORT
========================================================= */

function setupRealtime() {

    if (
        !supabaseClient
    )
        return;


    supabaseClient
        .channel(
            "kidora-therapist-dashboard"
        )
        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "profiles"
            },
            payload => {

                console.log(
                    "Profile update:",
                    payload
                );


                loadChildrenFromSupabase();

            }
        )
        .subscribe();

}


/* =========================================================
   PROFILE BUTTON
========================================================= */

$("#profileButton")
    ?.addEventListener(
        "click",
        () => {

            document
                .getElementById("settings")
                .scrollIntoView({
                    behavior: "smooth"
                });

        }
    );


/* =========================================================
   NOTIFICATION BUTTON
========================================================= */

$("#notificationButton")
    ?.addEventListener(
        "click",
        () => {

            document
                .getElementById("alertsSection")
                .scrollIntoView({
                    behavior: "smooth"
                });

        }
    );


/* =========================================================
   ADD CHILD
========================================================= */

$("#addChildButton")
    ?.addEventListener(
        "click",
        () => {

            alert(
                "Child assignment system will be connected to Supabase next."
            );

        }
    );


/* =========================================================
   NEW SESSION
========================================================= */

$("#newSessionButton")
    ?.addEventListener(
        "click",
        () => {

            alert(
                "New therapy session creation will be connected next."
            );

        }
    );


/* =========================================================
   GLOBAL DEBUG
========================================================= */

window.KIDORA_THERAPIST = {

    state,

    loadChildrenFromSupabase,

    setupRealtime,

    logout

};


console.log(
    "KIDORA Therapist Dashboard ready."
);