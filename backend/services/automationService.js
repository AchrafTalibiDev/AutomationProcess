import puppeteer from 'puppeteer';
import fs from 'fs';
import {authenticator} from "otplib";
import dotenv from "dotenv";
dotenv.config();
const loginAndExtractKey = async (acc) => {
    acc.secret2fa = undefined;
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: process.env.BRAVE_PATH,

        args: ['--start-maximized',
            '--disable-infobars',
            '--disable-blink-features=AutomationControlled'],
        defaultViewport: null,
    });

    const page = await browser.newPage();

    try {
        // 1. Aller sur la page de connexion Google
        await page.goto('https://accounts.google.com/signin/v2/identifier', { waitUntil: 'networkidle2' });
        // Étape 1 : email
        await page.waitForSelector('input[type="email"]', { visible: true });
        await page.type('input[type="email"]', acc.email, { delay: 100 });
        await Promise.all([
            page.click('#identifierNext'),
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
        ]);

        // Étape 2 : mot de passe
        await page.waitForSelector('input[type="password"]', { visible: true, timeout: 10000 });
        await page.type('input[type="password"]', acc.password, { delay: 100 });
        await page.click('#passwordNext');


// Vérifie si une vérification 2FA est demandée
        try {
            await new Promise(resolve => setTimeout(resolve, 4000));
            await page.waitForSelector('input[type="tel"]', { visible: true, timeout: 20000 });

            // Génère le code à 6 chiffres depuis le secret TOTP
            const otpCode = authenticator.generate(acc.secret2fa);
            console.log(`Code 2FA pour ${acc.email} : ${otpCode}`);

            // Renseigne le code dans le champ prévu
            await page.type('input[type="tel"]', otpCode, { delay: 100 });

            // Valide le formulaire 2FA
            await Promise.all([
                page.keyboard.press('Enter'), // ou click sur le bouton si nécessaire
                page.waitForNavigation({ waitUntil: 'networkidle2' }),
            ]);
        } catch (e) {
            console.log("Aucune vérification 2FA détectée. On continue...");
        }

        // 2. Aller à la page de gestion du compte Google
        await page.goto('https://myaccount.google.com/security', { waitUntil: 'networkidle2' });


        // Étape 5 : Faire défiler la page jusqu'à la section "Comment vous vous connectez à Google"
        await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight);  // Scroll vers le bas
        });


        // Étape 6 : Attendre que la section "Comment vous vous connectez à Google" soit visible en utilisant la classe 'Voxjqf'
        await page.waitForSelector('div.Z0Wvsf', { visible: true });
        console.log("Section trouvée : Comment vous vous connectez à Google");

        // Étape 6 : Cliquer sur "Validation en deux étapes"
        try {
            await page.waitForSelector('a.RlFDUe.I6g62c.N5YmOc.kJXJmd', { visible: true, timeout: 10000 });

            const clicked = await page.evaluate(() => {
                const links = [...document.querySelectorAll('a.RlFDUe.I6g62c.N5YmOc.kJXJmd')];
                for (const link of links) {
                    const labelDiv = link.querySelector('.bJCr1d');
                    if (labelDiv && labelDiv.textContent.includes('Validation en deux')) {
                        link.click();
                        return true;
                    }
                }
                return false;
            });

            if (clicked) {
                console.log("Clic sur 'Validation en deux étapes' réussi.");
                await new Promise(resolve => setTimeout(resolve, 4000)); // Attente manuelle pour que la navigation démarre
                try {
                    await page.evaluate(() => {
                        window.scrollBy(0, window.innerHeight);  // Scroll vers le bas
                    });
                    await page.waitForSelector('div.GqRghe.tXqPBe.hv7wl .mMsbvc', { visible: true, timeout: 10000 });

                    const clickedAuthenticator = await page.evaluate(() => {
                        const options = [...document.querySelectorAll('div.GqRghe.tXqPBe.hv7wl .mMsbvc')];
                        const authOption = options.find(el => el.textContent.includes('Authenticator'));
                        if (authOption) {
                            authOption.click();
                            return true;
                        }
                        return false;
                    });

                    if (clickedAuthenticator) {
                        console.log("Clic sur 'Authenticator' réussi.");
                        await new Promise(resolve => setTimeout(resolve, 4000));

                    } else {
                        console.error("Option 'Authenticator' non trouvée.");
                    }
                } catch (err) {
                    console.error("Erreur lors du clic sur 'Authenticator':", err.message);
                }
                // Étape : Cliquer sur le bouton "Configurer une appli d'authentification"
                try {
                    await page.waitForSelector('span.AeBiU-vQzf8d', { visible: true, timeout: 10000 });

                    const clicked = await page.evaluate(() => {
                        const spans = [...document.querySelectorAll('span.AeBiU-vQzf8d')];
                        for (const span of spans) {
                            if (span.textContent.includes("Configurer une appli d'authentification")) {
                                span.click();
                                return true;
                            }
                        }
                        return false;
                    });

                    if (clicked) {
                        console.log("Clic sur 'Configurer une appli d'authentification' réussi.");
                        await new Promise(resolve => setTimeout(resolve, 4000));
                    } else {
                        console.error("Bouton 'Configurer une appli d'authentification' introuvable.");
                    }
                } catch (err) {
                    console.error("Erreur lors du clic sur 'Configurer une appli d'authentification':", err.message);
                }
                // Étape : Cliquer sur "Vous ne pouvez pas le scanner ?"
                try {
                    await page.waitForSelector('span.mUIrbf-vQzf8d', { visible: true, timeout: 10000 });

                    const clicked = await page.evaluate(() => {
                        const spans = [...document.querySelectorAll('span.mUIrbf-vQzf8d')];
                        for (const span of spans) {
                            if (span.textContent.includes("Vous ne pouvez pas le scanner")) {
                                span.click();
                                return true;
                            }
                        }
                        return false;
                    });

                    if (clicked) {
                        console.log("Clic sur 'Vous ne pouvez pas le scanner ?' réussi.");
                        await new Promise(resolve => setTimeout(resolve, 4000));
                    } else {
                        console.error("Lien 'Vous ne pouvez pas le scanner ?' introuvable.");
                    }
                } catch (err) {
                    console.error("Erreur lors du clic sur 'Vous ne pouvez pas le scanner ?':", err.message);
                }
                // Étape : Extraire la clé secrète et la sauvegarder
                try {
                    await page.waitForSelector('ol.AOmWL li.mzEcT strong', { visible: true, timeout: 10000 });

                    const secretKey = await page.evaluate(() => {
                        const items = [...document.querySelectorAll('ol.AOmWL li.mzEcT')];
                        for (const item of items) {
                            if (item.textContent.includes('Saisissez votre adresse e-mail')) {
                                const strongTag = item.querySelector('strong:last-of-type');
                                return strongTag?.textContent?.replace(/\s+/g, '') || null;
                            }
                        }
                        return null;
                    });

                    if (secretKey) {
                        console.log("Clé extraite :", secretKey);
                        // Sauvegarder la clé dans un fichier
                        fs.writeFileSync(`secret_key_${acc.email}.txt`, secretKey);
                        console.log(`Clé sauvegardée dans 'secret_key_${acc.email}.txt'`);
                    } else {
                        console.error("Clé secrète introuvable.");
                    }
                } catch (err) {
                    console.error("Erreur lors de l'extraction de la clé secrète :", err.message);
                }
            } else {
                console.error("Élément 'Validation en deux étapes' introuvable ou non cliquable.");
            }
        } catch (err) {
            console.error("Erreur lors du clic sur 'Validation en deux étapes':", err.message);
        }

    } catch (err) {
        console.error(`Erreur pour ${acc.email}:`, err.message);
    } finally {
        await browser.close();
    }
};
export const automateGmailKeyExtraction = async (accounts) => {
    for (const acc of accounts) {
        await loginAndExtractKey(acc);
    }
};