import puppeteer from 'puppeteer';
import { initializeApp } from "firebase/app";
import { getDownloadURL, getStorage, ref, uploadBytes, uploadString } from "firebase/storage";
import { getFirestore, collection, getDoc, doc, setDoc, updateDoc, arrayUnion } from "firebase/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyCz7bQHB_QnBLwtl1fPPPu7BonKQx45UWQ",
    authDomain: "newarchive-1804f.firebaseapp.com",
    projectId: "newarchive-1804f",
    storageBucket: "newarchive-1804f.appspot.com",
    messagingSenderId: "1044080316873",
    appId: "1:1044080316873:web:86a6316a0c6abff0351818",
    measurementId: "G-5BSDE1R0F1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app)
const today = new Date();


async function Start() {
    const browser = await puppeteer.launch({
        headless: true
    });

    // add different websites here

    const page1 = await browser.newPage();
    const page2 = await browser.newPage();
    page1.setDefaultNavigationTimeout(0);
    await page1.goto('https://www.news18.com/') //replace the link from which you wanna extract the text and img
    page2.setDefaultNavigationTimeout(0);
    await page2.goto('https://www.indiatoday.in/') //replace the link from which you wanna extract the text and img
    // page1.waitForSelector('#__next > div.jsx-368370242.home_wrapper > div:nth-child(1) > div > div.jsx-368370242.left_row > div.jsx-3107391233.top_story > div.jsx-3107391233.top_story_left > div > figure > a.jsx-3107391233.head_story_title > figcaption > h1')
    // await page.screenshot({ path: 'i.png' })

    const data1 = await page1.evaluate(() => {
        const image = document.querySelectorAll('#__next > div.jsx-368370242.home_wrapper > div:nth-child(1) > div > div.jsx-368370242.left_row > div.jsx-3107391233.top_story > div.jsx-3107391233.top_story_left > div > figure > a:nth-child(1) > img')
        const url = Array.from(image).map(x => x.src)

        return url;
    })

    const headline1 = await page1.evaluate(() => {
        return Array.from(document.querySelectorAll('#__next > div.jsx-368370242.home_wrapper > div:nth-child(1) > div > div.jsx-368370242.left_row > div.jsx-3107391233.top_story > div.jsx-3107391233.top_story_left > div > figure > a.jsx-3107391233.head_story_title > figcaption > h1') // selector which you wanna scrape the text
        ).map(x => x.textContent)

    })

    const data2 = await page2.evaluate(() => {
        const image = document.querySelectorAll('#block-itg-widget-home-page-feature > div > div.featured-post.featured-post-first > a > img')
        const url = Array.from(image).map(x => x.src);

        return url;
    })


    const headline2 = await page2.evaluate(() => {
        return Array.from(document.querySelectorAll('#block-itg-widget-home-page-feature > div > div.featured-post.featured-post-first > h2 > a') // selector which you wanna scrape the text
        ).map(x => x.title)

    })

    await browser.close();



    const reffff = doc(db, "news", `${today.toDateString()}`)
    const docSnap = await getDoc(reffff);
    // console.log(docSnap)

    if (docSnap.exists()) {
        const dbRef = doc(db, 'news', `${today.toDateString()}`)
        await updateDoc(dbRef, {
            News_18: arrayUnion({
                img: `${data1[0]}`,
                headline: `${headline1[0]}`
            }),
            indiatoday: arrayUnion({
                img: `${data2[0]}`,
                headline: `${headline2[0]}`
            })

        })
    } else {
        await setDoc(doc(db, 'news', `${today.toDateString()}`), {
            News_18: arrayUnion({
                img: `${data1[0]}`,
                headline: `${headline1[0]}`
            }),
            indiatoday: arrayUnion({
                img: `${data2[0]}`,
                headline: `${headline2[0]}`
            })

        })
    }

}


Start();
