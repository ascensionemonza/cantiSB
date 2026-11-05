function codice(id)
{
    if (!id) return "";

    id = id.toUpperCase().trim();

    const lettera =
        id.match(/^([A-Z])\s*(\d+)$/);

    if (lettera)
    {
        return (
            lettera[1] +
            lettera[2].padStart(2, "0")
        );
    }

    if (/^\d+$/.test(id))
    {
        return id.padStart(3, "0");
    }

    return id.replace(/\s+/g, "");
}

function mostraVoce(voce)
{
    const container =
        document.getElementById("contenuto");

    const voceReale =
        window.aliasAutomatici?.[voce]
        || voce;

    window.voceCorrente =
        voceReale;

    if (window.isSpecial163)
    {
        container
            .querySelectorAll(
                ".femmine, .tenori, .bassi"
            )
            .forEach(v =>
                v.style.display = "none"
            );

        aggiornaVoceNeiMisteriAperti();
    }
    else
    {
        document
            .querySelectorAll(".voce")
            .forEach(v =>
                v.style.display = "none");

        const target =
            document.getElementById(voceReale);

        if (target)
        {
            target.style.display = "block";
        }
    }

    document
        .querySelectorAll(".voceBox a")
        .forEach(btn =>
            btn.classList.remove("attivo"));

    const btnAttivo =
        document.querySelector(
            `.voceBox a[data-voce="${voce}"]`
        );

    if (btnAttivo)
    {
        btnAttivo.classList.add("attivo");
    }
}

function aggiornaVoceNeiMisteriAperti()
{
    if (!window.isSpecial163)
        return;

    const container =
        document.getElementById("contenuto");

    const voceCorrente =
        window.voceCorrente ||
        "femmine";

    container
        .querySelectorAll(".mistero.aperto")
        .forEach(mistero =>
        {
            mistero
                .querySelectorAll(
                    ".femmine, .tenori, .bassi"
                )
                .forEach(v =>
                    v.style.display = "none");

            const target =
                mistero.querySelector(
                    "." + voceCorrente
                );

            if (target)
            {
                target.style.display =
                    "block";
            }
        });
}

function selezionaVoce(voce)
{
    if (voce === "specialeA09")
    {
        localStorage.setItem(
            "vocePreferitaA09",
            voce
        );
    }
    else if (
        [
            "soprani",
            "contralti",
            "tenori",
            "bassi"
        ].includes(voce)
    )
    {
        localStorage.setItem(
            "vocePreferita",
            voce
        );

        if (window.isA09)
        {
            localStorage.removeItem(
                "vocePreferitaA09"
            );
        }
    }
    else if (
        [
            "femmine",
            "maschi"
        ].includes(voce)
    )
    {
        localStorage.setItem(
            "vocePreferitaFM",
            voce
        );
    }

    mostraVoce(voce);
}

async function caricaCanto(id)
{
    const container =
        document.getElementById("contenuto");

    window.isSpecial163 = false;

    const nomeFile =
        codice(id);

    const file =
        "canti/" +
        nomeFile +
        ".html";

    if (nomeFile.startsWith("163"))
    {
        window.isSpecial163 = true;
    }

    window.isA09 =
        nomeFile === "A09";

    try
    {
        const html =
            await (
                await fetch(file)
            ).text();

        container.innerHTML = "";

        container.insertAdjacentHTML(
            "beforeend",
            html
        );

        container
            .querySelectorAll("script")
            .forEach(oldScript =>
            {
                const newScript =
                    document.createElement(
                        "script"
                    );

                newScript.textContent =
                    oldScript.textContent;

                container.appendChild(
                    newScript
                );
            });

        let vociPresenti;

        if (window.isSpecial163)
        {
            vociPresenti =
                [...container.querySelectorAll(
                    ".femmine, .tenori, .bassi"
                )]
                .map(v =>
                    v.classList[0]
                );
        }
        else
        {
            vociPresenti =
                [...container.querySelectorAll(
                    ".voce"
                )]
                .map(v =>
                    v.id
                );
        }

        const bottoni =
            [...container.querySelectorAll(
                ".voceBox a"
            )];

        window.aliasAutomatici = {};

        bottoni.forEach(btn =>
        {
            const voce =
                btn.dataset.voce;

            if (
                !vociPresenti.includes(
                    voce
                )
            )
            {
                window.aliasAutomatici[
                    voce
                ] =
                vociPresenti[0];
            }
        });

        const voceSB =
            localStorage.getItem(
                "vocePreferita"
            );

        const voceSBspeciale =
            localStorage.getItem(
                "vocePreferitaA09"
            );

        const voceFM =
            localStorage.getItem(
                "vocePreferitaFM"
            );

        setTimeout(() =>
        {
            let voceDaCaricare =
                null;

            if (
                window.isA09 &&
                voceSBspeciale
            )
            {
                voceDaCaricare =
                    voceSBspeciale;
            }
            else if (voceSB)
            {
                voceDaCaricare =
                    voceSB;
            }
            else if (voceFM)
            {
                voceDaCaricare =
                    voceFM;
            }
            else
            {
                voceDaCaricare =
                    vociPresenti[0];
            }

            if (voceDaCaricare)
            {
                mostraVoce(
                    voceDaCaricare
                );
            }

        }, 0);

        if (window.isSpecial163)
        {
            requestAnimationFrame(() =>
            {
                container
                    .querySelectorAll(
                        ".mistero-header"
                    )
                    .forEach(header =>
                    {
                        header.addEventListener(
                            "click",
                            () =>
                            {
                                const mistero =
                                    header.parentElement;

                                const aperto =
                                    mistero.classList.toggle(
                                        "aperto"
                                    );

                                mistero
                                    .querySelector(
                                        ".mistero-contenuto"
                                    )
                                    .style.display =
                                        aperto
                                        ? "block"
                                        : "none";

                                aggiornaVoceNeiMisteriAperti();
                            }
                        );
                    });
            });
        }

    }
    catch
    {
        container.innerHTML =
            "<h2>Canto non trovato</h2>";
    }
}