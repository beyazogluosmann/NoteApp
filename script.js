const API_KEY = "AIzaSyC0iguwzQkwydOHhuVkMrIDcedLHg48dQ8"; // Google Fonts API anahtarınızı buraya ekleyin
const FONT_API_URL = `https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}`;
const notesContainer = document.querySelector(".notes-container");
let currentId = 1; // ID'lerin başlangıç değeri

const addBtn = document.getElementById("add");
const deleteAllBtn = document.getElementById("delete-all");
const deleteSelectedBtn = document.getElementById("delete-selected");

const notes = JSON.parse(localStorage.getItem("notes"));


addBtn.addEventListener("click", () => {
    fetchFonts().then((fonts) => {
        addNewNote("", currentId++, "Arial", fonts); // Varsayılan bir not ekle
    });
});



if (notes) {
    fetchFonts().then((fonts) => {
        notes.forEach((note) => {
            addNewNote(note.text, note.id, note.fontFamily || "Arial", fonts); // Yazı tipi ekleniyor
            currentId = Math.max(currentId, parseInt(note.id) + 1); // ID'yi güncelle
        });
    });
}




// Yazı tiplerini API'den çek ve `<select>` öğesini doldur
async function fetchFonts() {
    try {
        const response = await fetch(FONT_API_URL);
        const data = await response.json();
        return data.items.map((font) => font.family); // Yazı tiplerini döndür
    } catch (error) {
        console.error("Yazı tipleri alınırken hata oluştu:", error);
        return ["Poppins", "Arial", "Courier New", "Times New Roman"]; // Hata durumunda varsayılan yazı tipleri
    }
}

// Yeni not ekleme fonksiyonu
function addNewNote(text = "", id = currentId++, fontFamily = "Arial", fonts = []) {
    const note = document.createElement("div");
    note.classList.add("note");
    note.setAttribute("data-id", id);

    // Yazı tipini DOM'a ekle
    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, "+")}&display=swap`;
    document.head.appendChild(fontLink);

    note.innerHTML = `
        <div class="notes">
            <div class="tools">
                <input type="checkbox" class="select-note" />
                <button class="edit"><i class="fas fa-edit"></i></button>
                <button class="delete"><i class="fas fa-trash-alt"></i></button>
                <button class="bold"><i class="fas fa-bold"></i></button> <!-- Bold butonu -->
                <select class="note-font-family">
                    ${fonts.map((font) => `<option value="${font}" ${font === fontFamily ? "selected" : ""}>${font}</option>`).join("")}
                </select>
                <input type="number" class="note-font-size" value="16" min="10" max="30" />
            </div>
            <div class="main ${text ? "" : "hidden"}" style="font-family: ${fontFamily};"></div>
            <textarea class="${text ? "hidden" : ""}" style="font-family: ${fontFamily};"></textarea>
        </div>
    `;

    const fontFamilySelect = note.querySelector(".note-font-family");
    const fontSizeInput = note.querySelector(".note-font-size");
    const textArea = note.querySelector("textarea");
    const main = note.querySelector(".main");
    const boldBtn = note.querySelector(".bold");

    // İçeriğe göre yükseklik ayarla
    textArea.style.height = "auto";
    textArea.style.minHeight = "150px";
    textArea.value = text;
    main.innerHTML = marked(text);

    // Dinamik yükseklik ayarı
    textArea.style.height = `${textArea.scrollHeight}px`;

    // Yazı tipi değiştirme işlevi
    fontFamilySelect.addEventListener("change", () => {
        const selectedFont = fontFamilySelect.value;

        // Google Fonts'tan çekilen yazı tipini DOM'a ekle
        const fontLink = document.createElement("link");
        fontLink.rel = "stylesheet";
        fontLink.href = `https://fonts.googleapis.com/css2?family=${selectedFont.replace(/ /g, "+")}&display=swap`;
        document.head.appendChild(fontLink);

        // Yazı tipini notlara uygula
        note.querySelector(".main").style.fontFamily = selectedFont;
        note.querySelector("textarea").style.fontFamily = selectedFont;

        updateLS(); // Yazı tipi değişikliğini kaydet
    });

    // Yazı boyutu değiştirme işlevi
    fontSizeInput.addEventListener("input", () => {
        const selectedSize = fontSizeInput.value + "px";
        note.querySelector(".main").style.fontSize = selectedSize;
        note.querySelector("textarea").style.fontSize = selectedSize;
    });

    // Bold butonuna tıklama işlevi
    boldBtn.addEventListener("click", () => {
        const isBold = main.style.fontWeight === "bold";
        main.style.fontWeight = isBold ? "normal" : "bold";
        textArea.style.fontWeight = isBold ? "normal" : "bold";
        updateLS(); // Değişikliği kaydet
    });

    // Düzenleme butonu işlevi
    const editBtn = note.querySelector(".edit");
    editBtn.addEventListener("click", () => {
        main.classList.toggle("hidden");
        textArea.classList.toggle("hidden");
    });

    // Silme butonu işlevi
    const deleteBtn = note.querySelector(".delete");
    deleteBtn.addEventListener("click", () => {
        const id = note.getAttribute("data-id");
        note.remove();
        updateLS();
        alert(`Not ID=${id} başarıyla silindi.`);
    });

    // Metin giriş işlevi
    textArea.addEventListener("input", (e) => {
        const { value } = e.target;
        main.innerHTML = marked(value);
        textArea.style.height = "auto"; // Yükseklik sıfırla
        textArea.style.height = `${textArea.scrollHeight}px`; // İçeriğe göre yükseklik ayarla
        updateLS();
    });

    notesContainer.appendChild(note);
    updateLS();
}

// LocalStorage güncelleme fonksiyonu
function updateLS() {
    const notesElements = document.querySelectorAll(".note");

    const notes = [];

    notesElements.forEach((noteEl) => {
        const id = noteEl.getAttribute("data-id");
        const text = noteEl.querySelector("textarea").value;
        const fontFamily = noteEl.querySelector(".note-font-family").value;

        notes.push({ id, text, fontFamily });
    });

    localStorage.setItem("notes", JSON.stringify(notes));
}

// Tüm notları silme işlevi
deleteAllBtn.addEventListener("click", () => {
    const notes = document.querySelectorAll(".note");
    notes.forEach((note) => note.remove());
    localStorage.removeItem("notes");
    alert("Tüm notlar başarıyla silindi!");
});

// Seçilen notları silme işlevi
deleteSelectedBtn.addEventListener("click", () => {
    const selectedNotes = document.querySelectorAll(".select-note:checked");
    selectedNotes.forEach((checkbox) => {
        const note = checkbox.closest(".note");
        note.remove();
    });
    updateLS();
    alert("Seçilen notlar başarıyla silindi!");
});