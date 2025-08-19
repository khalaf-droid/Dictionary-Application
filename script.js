const searchInput = document.getElementById('searchInput'); 
const searchButton = document.getElementById('searchButton');
const resultContainer = document.getElementById('result-container');
const wordTitle = document.getElementById('wordTitle');
const wordDescription = document.getElementById('wordDescription');
const audioButton = document.getElementById('audioButton');


// ربط الزرار بدالة البحث: لما المستخدم يدوس على زرار البحث
searchButton.addEventListener("click", () => {
    search();
});

// ربط زرار Enter على الـ input: لو المستخدم ضغط Enter يحصل بحث
searchInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {   // بنتحقق إن المفتاح المضغوط هو Enter
        search();
    }
});

function search() {
    const searchTerm = searchInput.value.trim();
    // بقرأ قيمة الحقل وبشيل المسافات من البداية والنهاية باستخدام trim()

    if (searchTerm === '') {       // لو المستخدم مسيب الحقل فاضي
        alert('Please Enter a word to Search..'); // ننبّهه إن لازم يدخل كلمة
        return;                    // ونوقف تنفيذ الدالة
    }

    fetchDictionaryData(searchTerm);
    // لو فيه كلمة، بنديها للدالة اللي هتجيب الداتا من الـ API
}

async function fetchDictionaryData(searchTerm) {
    try {
        // بنعمل fetch للـ API بتاع dictionaryapi.dev مع كلمة البحث
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${searchTerm}`);

        if (!response.ok) {        // لو الاستجابة مش 200-299
            throw new Error('Failed to fetch the Data'); // نرمي خطأ وندخل للـ catch
        }

        const data = await response.json(); // نحوّل الرد لكائن جافاسكربت (غالبًا مصفوفة)
        displayResult(data);                 // نبعت الداتا لدالة العرض

    } catch (error) {
        console.log(error);                  // نطبع الخطأ في الكونسول للتصحيح
        alert('An error Occured.');          // وننبّه المستخدم إن في مشكلة عامة
    }
}

function displayResult(data) {
    resultContainer.style.display = 'block';
    // نعرض حاوية النتيجة (لو كانت مخفية افتراضياً)

    const wordData = data[0];
    // نأخذ العنصر الأول من الرد — الـ API بيرجع مصفوفة من النتائج أحيانًا
    // ↑ ملاحظة: لازم تتأكد إن data و data[0] موجودين قبل الوصول لهم، عشان مايبقاش خطأ لو الكلمة مش موجودة

    wordTitle.textContent = wordData.word;
    // نعرض الكلمة في العنوان

    // هنا بنبني HTML بسيط فيه قائمة بالتعاريف لكل معنى (meanings)
    wordDescription.innerHTML = `
       <ul> 
        ${wordData.meanings.map(meaning => `
            <li>
                <p><strong>Part of Speech: </strong> ${meaning.partOfSpeech}</p>
                <p><strong>Definition: </strong> ${meaning.definitions[0].definition}</p>
            </li>
        
        `).join('\n')}
       </ul>
    `;
    // - wordData.meanings: مصفوفة المعاني لكل partOfSpeech
    // - بنعمل map على كل meaning ونطلّع أول تعريف من meaning.definitions[0]
    // - بنحول الناتج لسلسلة نصية ونحطه داخل innerHTML لعرضه
    // ملاحظات مهمة:
    // - لو meanings فاضية أو definitions فاضية الكود ده ممكن يرمي خطأ — ممكن تضيف فحوصات (guards).
    // - استخدام innerHTML جيد هنا لأنه محتوى من API معروف، لكن لو المحتوى جاي من مصدر غير موثوق لازم تنظيف (sanitize).
}
audioButton.addEventListener("click", () => {
    const searchTerm = searchInput.value.trim(); // نقراً نفس قيمة الحقل قبل تشغيل النطق
    if (searchTerm === '') {                     // لو فاضي، ننبّه المستخدم
        alert('Please Enter a word to Search..');
        return;
    }

    speak(searchTerm);                           // ننده على دالة النطق بالصوت
});

function speak(word) {
    const speech = new SpeechSynthesisUtterance(word);
    // بنكوّن كائن نطق (Web Speech API) ونمررله الكلمة

    speech.lang = 'en-US';  // نحدد اللغة (مهم لو عايز لهجة معينة)
    speech.volume = 2;      // حجم الصوت
    // ملاحظة: قيمة volume المفترضة هي من 0 لـ 1. كتابة 2 هنا ممكن ما تأثرش أو تعتبر 1 حسب المتصفح.
    // الأحسن تستخدم قيمة بين 0 و 1، زي speech.volume = 1;

    speech.rate = 1;        // سرعة النطق (1 هو الافتراضي)
    speech.pitch = 1;       // طبقة الصوت (pitch) — 1 هو الافتراضي

    window.speechSynthesis.speak(speech); // نشغّل النطق في المتصفح
    // ملاحظة: بعض المتصفحات تطلب تفاعل مستخدم صريح قبل تشغيل الصوت، وبعضها ممكن يقيد الأصوات التلقائية.
}
