/* =========================================================
   KIDORA APP
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("======================================");
    console.log("KIDORA initializing...");
    console.log("======================================");


    /* =====================================================
       MOBILE MENU
    ====================================================== */

    const mobileMenuBtn =
        document.getElementById("mobileMenuBtn");

    const mobileMenu =
        document.getElementById("mobileMenu");


    if (mobileMenuBtn && mobileMenu) {

        mobileMenuBtn.addEventListener(
            "click",
            () => {

                const isOpen =
                    mobileMenu.classList.toggle("active");


                mobileMenuBtn.setAttribute(
                    "aria-expanded",
                    isOpen
                );


                const icon =
                    mobileMenuBtn.querySelector("i");


                if (icon) {

                    icon.className =
                        isOpen
                            ? "fa-solid fa-xmark"
                            : "fa-solid fa-bars";

                }

            }
        );


        /* Close menu after navigation */

        mobileMenu
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    () => {

                        mobileMenu
                            .classList
                            .remove("active");

                        mobileMenuBtn
                            .setAttribute(
                                "aria-expanded",
                                "false"
                            );


                        const icon =
                            mobileMenuBtn
                                .querySelector("i");


                        if (icon) {

                            icon.className =
                                "fa-solid fa-bars";

                        }

                    }
                );

            });

    }


    /* =====================================================
       SIMPLE SCROLL REVEAL
    ====================================================== */

    const revealElements =
        document.querySelectorAll(
            ".feature-card, .step, .tech-item"
        );


    const revealObserver =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            "visible"
                        );

                        revealObserver.unobserve(
                            entry.target
                        );

                    }

                });

            },
            {
                threshold: 0.12
            }
        );


    revealElements.forEach(element => {

        element.classList.add("reveal");

        revealObserver.observe(element);

    });


    console.log("KIDORA loaded successfully.");

});