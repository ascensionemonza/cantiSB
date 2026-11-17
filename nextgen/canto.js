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

    window.idCantoCorrente =
        nomeFile;

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

        await inizializzaVistaCanto();

    }
    catch
    {
        container.innerHTML =
            "<h2>Canto non trovato</h2>";
    }
}



async function inizializzaVistaCanto()
{
    const vistaBox =
        document.getElementById(
            "vistaBox"
        );

    if (!vistaBox)
    {
        return;
    }

    try
    {
        const risposta =
            await fetch(
                "../musicisti/elenco.json"
            );

        const elenco =
            await risposta.json();

        const documenti =
            elenco.spartiti.filter(
                x =>
                    x.id ===
                    window.idCantoCorrente
            );

        if (!documenti.length)
        {
            vistaBox.style.display =
                "none";

            return;
        }

        vistaBox.style.display =
            "block";

        const btnTesto =
            document.getElementById(
                "btnTesto"
            );

        const btnSpartito =
            document.getElementById(
                "btnSpartito"
            );

        btnTesto.onclick =
            mostraVistaTesto;

        btnSpartito.onclick =
            mostraVistaSpartito;

        const vista =
            localStorage.getItem(
                "vistaCanto"
            ) || "testo";

        if (vista === "spartito")
        {
            await mostraVistaSpartito();
        }
        else
        {
            mostraVistaTesto();
        }
    }
    catch (e)
    {
        console.error(e);
    }
}

function mostraVistaTesto()
{
    localStorage.setItem(
        "vistaCanto",
        "testo"
    );

    document.getElementById(
        "contenuto"
    ).style.display =
        "block";

    document.getElementById(
        "spartitoContainer"
    ).style.display =
        "none";

    document.getElementById(
        "btnTesto"
    )?.classList.add(
        "attivo"
    );

    document.getElementById(
        "btnSpartito"
    )?.classList.remove(
        "attivo"
    );
}

async function mostraVistaSpartito()
{
    localStorage.setItem(
        "vistaCanto",
        "spartito"
    );

    document.getElementById(
        "btnSpartito"
    )?.classList.add(
        "attivo"
    );

    document.getElementById(
        "btnTesto"
    )?.classList.remove(
        "attivo"
    );

    const contenuto =
        document.getElementById(
            "contenuto"
        );

    const spartito =
        document.getElementById(
            "spartitoContainer"
        );

    contenuto.style.display =
        "none";

    spartito.style.display =
        "block";

    if (
        spartito.dataset.caricato ===
        window.idCantoCorrente
    )
    {
        return;
    }

    spartito.innerHTML =
        "Caricamento spartito...";

    try
    {
        const risposta =
            await fetch(
                "../musicisti/elenco.json"
            );

        const elenco =
            await risposta.json();

        const documenti =
            elenco.spartiti.filter(
                x =>
                    x.id ===
                    window.idCantoCorrente
            );

        if (!documenti.length)
        {
            spartito.innerHTML =
                "<h2>Spartito non disponibile</h2>";

            return;
        }

        const documento =

            documenti.find(
                x => x.tipo_file === "coro"
            )

            ||

            documenti.find(
                x => x.tipo_file === "spartito"
            )

            ||

            documenti.find(
                x => x.tipo_file === ""
            )

            ||

            documenti[0];

        const file =
            "../musicisti/" +
            documento.file;

        spartito.dataset.caricato =
            window.idCantoCorrente;

        if (
            /\.(jpg|jpeg|png|webp)$/i
            .test(file)
        )
        {
            spartito.innerHTML =
                `<img src="${file}" alt="Spartito">`;
        }
        else
        {
            const pdfUrl =
                new URL(
                    file,
                    location.href
                ).href;

            spartito.innerHTML =
                `<iframe
                    src="/cantiSB/pdfjs/web/viewer.html?file=${encodeURIComponent(pdfUrl)}">
                </iframe>`;
        }
    }
    catch (errore)
    {
        console.error(
            errore
        );

        spartito.innerHTML =
            "<h2>Errore caricamento spartito</h2>";
    }
}