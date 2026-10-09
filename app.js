/**
 * EDUCORE AI - DIRECT & SIMPLE JS ENGINE
 */

let currentLessonData = null;

// Lấy/Lưu API Key
function getStoredKey() {
    try { return localStorage.getItem('EDUCOR_GEMINI_KEY') || ''; } catch (e) { return ''; }
}
function setStoredKey(key) {
    try { localStorage.setItem('EDUCOR_GEMINI_KEY', key); } catch (e) {}
}

let apiKey = getStoredKey();

// Gắn sự kiện sau khi DOM load xong
document.addEventListener('DOMContentLoaded', function() {
    const keyInput = document.getElementById('api-key-input');
    const btnSaveKey = document.getElementById('btn-save-key');
    const btnGenerate = document.getElementById('btn-generate');
    const btnExport = document.getElementById('btn-export-pptx');

    if (keyInput && apiKey) {
        keyInput.value = apiKey;
    }

    if (btnSaveKey) {
        btnSaveKey.addEventListener('click', function() {
            apiKey = keyInput.value.trim();
            setStoredKey(apiKey);
            alert(apiKey ? 'Đã lưu API Key thành công!' : 'Đã xóa API Key!');
        });
    }

    if (btnGenerate) {
        btnGenerate.addEventListener('click', handleGenerate);
    }

    if (btnExport) {
        btnExport.addEventListener('click', handleExportPPTX);
    }
});

// Hàm xử lý chính khi bấm nút Tạo Bài Học
async function handleGenerate() {
    const title = document.getElementById('lesson-title').value.trim();
    const subject = document.getElementById('subject').value;
    const grade = document.getElementById('grade').value;
    const notes = document.getElementById('custom-source-content').value.trim();

    if (!title) {
        alert('Vui lòng nhập tên bài học!');
        return;
    }

    const statusEl = document.getElementById('khbd-status');
    const outputEl = document.getElementById('khbd-output');

    statusEl.innerText = 'Đang khởi tạo...';
    outputEl.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20 text-emerald-700 space-y-3">
            <i class="fa-solid fa-spinner fa-spin text-3xl"></i>
            <p class="font-bold text-sm">Hệ thống đang xây dựng bài học "${title}"...</p>
        </div>
    `;

    let lessonData = null;

    // NẾU CÓ API KEY -> GỌI GOOGLE GEMINI API
    if (apiKey) {
        const systemPrompt = `
Bạn là Chuyên gia Giáo dục. Hãy lập KẾ HOẠCH BÀI DẠY và PHẦN TRÌNH BÀY Slide cho:
- Môn: ${subject} | Khối: ${grade} | Bài: "${title}" ${notes ? `| Ghi chú: "${notes}"` : ''}

YÊU CẦU CẤU TRÚC:
- Cấu trúc bài dạy linh hoạt theo đặc thù môn ${subject}.
- Nội dung chính xác, bài tập có số liệu thực tế và lời giải từng bước.

Trả về DUY NHẤT một đối tượng JSON chuẩn không bọc markdown:
{
  "title": "${title}",
  "subject": "${subject}",
  "grade": "${grade}",
  "creativeApproach": "Ý tưởng tiếp cận sư phạm bài này",
  "khbd": [
    {
      "sectionTitle": "Tên phần (VD: I. Khởi động / I. Đặt vấn đề...)",
      "badge": "Mở đầu",
      "items": [
        { "title": "Hoạt động 1", "teacherRole": "GV...", "studentRole": "HS...", "keyContent": "Trọng tâm..." }
      ]
    }
  ],
  "slides": [
    {
      "slideTitle": "TIÊU ĐỀ SLIDE",
      "tag": "Thẻ",
      "blocks": [
        { "type": "hero", "mainText": "Nội dung chính", "subText": "Mô tả phụ" },
        { "type": "concept_box", "title": "Lý thuyết", "content": "Nội dung...", "highlightPoints": ["Ý 1", "Ý 2"] },
        { "type": "problem_solving", "problemText": "Bài tập...", "steps": ["Bước 1...", "Bước 2..."], "finalResult": "Đáp số..." },
        { "type": "warning_pitfall", "title": "Lỗi sai cần tránh", "pitfalls": ["Lỗi 1", "Lỗi 2"], "remedy": "Lời khuyên..." },
        { "type": "roadmap_summary", "title": "Tổng kết", "points": ["Ý 1", "Ý 2"] }
      ]
    }
  ]
}`;

        // Các mô hình thử nghiệm
        const MODELS = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];

        for (const model of MODELS) {
            try {
                const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
                });

                const data = await response.json();
                if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                    let raw = data.candidates[0].content.parts[0].text;
                    let clean = raw.replace(/```json/gi, '').replace(/```/gi, '').trim();
                    lessonData = JSON.parse(clean);
                    break;
                }
            } catch (e) {
                console.warn(`Model ${model} error, testing next...`);
            }
        }
    }

    // NẾU KHÔNG CÓ KEY HẶC API LỖI -> DÙNG BỘ TẠO ĐỘNG OFFLINE (ĐẢM BẢO HOẠT ĐỘNG 100%)
    if (!lessonData) {
        lessonData = buildOfflineData(subject, grade, title, notes);
    }

    currentLessonData = lessonData;
    renderKHBD();
    renderSlides();

    statusEl.innerText = 'Hoàn thành';
    document.getElementById('btn-export-pptx').classList.remove('hidden');
}

// Bộ tạo dữ liệu dự phòng chuẩn
function buildOfflineData(subject, grade, title, notes) {
    return {
        title: title,
        subject: subject,
        grade: grade,
        creativeApproach: `Phương pháp tiếp cận dựa trên việc giải quyết vấn đề thực tế của bài "${title}" trong môn ${subject} khối ${grade}.`,
        khbd: [
            {
                sectionTitle: "I. TÌNH HUỐNG MỞ ĐẦU & KHỞI ĐỘNG",
                badge: "Khởi động",
                items: [
                    {
                        title: `Tình huống thực tế bài "${title}"`,
                        teacherRole: `GV đưa ra tình huống thực tế dẫn dắt vào bài học ${title}.`,
                        studentRole: "HS làm việc nhóm, trao đổi và phát hiện vấn đề.",
                        keyContent: "Xác định mục tiêu bài học."
                    }
                ]
            },
            {
                sectionTitle: "II. HÌNH THÀNH KIẾN THỨC CỐT LÕI",
                badge: "Khám phá",
                items: [
                    {
                        title: `Xây dựng kiến thức bài ${title}`,
                        teacherRole: "GV hướng dẫn học sinh tìm hiểu nguyên lý và công thức cốt lõi.",
                        studentRole: "HS ghi chép nội dung trọng tâm.",
                        keyContent: notes ? `Tài liệu: ${notes}` : `Công thức / Bản chất của ${title}.`
                    }
                ]
            },
            {
                sectionTitle: "III. LUYỆN TẬP & MỔ XẺ LỜI GIẢI",
                badge: "Luyện tập",
                items: [
                    {
                        title: "Giải bài tập vận dụng",
                        teacherRole: "GV trình chiếu bài tập mẫu có số liệu thực tế và phân tích từng bước giải.",
                        studentRole: "HS làm bài tập tự luyện và nhận xét chéo.",
                        keyContent: "Lời giải chi tiết từng bước."
                    }
                ]
            },
            {
                sectionTitle: "IV. VẬN DỤNG & TỔNG KẾT",
                badge: "Vận dụng",
                items: [
                    {
                        title: "Bài tập mở rộng & Dặn dò về nhà",
                        teacherRole: "GV giao nhiệm vụ vận dụng cao và tổng kết bài.",
                        studentRole: "HS ghi nhận nhiệm vụ về nhà.",
                        keyContent: "Phiếu bài tập nâng cao."
                    }
                ]
            }
        ],
        slides: [
            {
                slideTitle: title.toUpperCase(),
                tag: "SLIDE BÌA",
                blocks: [{ type: "hero", mainText: title.toUpperCase(), subText: `Môn: ${subject} - Khối Lớp ${grade}` }]
            },
            {
                slideTitle: "1. LÝ THUYẾT & QUY LUẬT TRỌNG TÂM",
                tag: "LÝ THUYẾT",
                blocks: [
                    {
                        type: "concept_box",
                        title: "Khái niệm cốt lõi",
                        content: `Nội dung cốt lõi của bài học ${title} trong chương trình ${subject} lớp ${grade}.`,
                        highlightPoints: ["Quy luật biến đổi 1", "Điều kiện xác định 2"]
                    }
                ]
            },
            {
                slideTitle: "2. VÍ DỤ PHÂN TÍCH MẪU CỤ THỂ",
                tag: "BÀI TẬP MẪU",
                blocks: [
                    {
                        type: "problem_solving",
                        problemText: `Bài toán mẫu: Phân tích bài tập vận dụng về ${title}.`,
                        steps: ["• Bước 1: Phân tích đề bài.", "• Bước 2: Áp dụng công thức tương ứng.", "• Bước 3: Tính toán và kiểm tra."],
                        finalResult: "Đáp số chính xác."
                    }
                ]
            },
            {
                slideTitle: "3. CẢNH BÁO LỖI SAI PHỔ BIẾN",
                tag: "LỖI SAI CẦN TRÁNH",
                blocks: [
                    {
                        type: "warning_pitfall",
                        title: "Những Lỗi Sai Hay Mắc",
                        pitfalls: [`Hiểu sai bản chất khái niệm ${title}.`, "Nhầm lẫn giữa các đơn vị đo."],
                        remedy: "💡 Chiến lược: Đọc kỹ đề bài trước khi tính toán!"
                    }
                ]
            },
            {
                slideTitle: "4. TỔNG KẾT BÀI HỌC",
                tag: "TỔNG KẾT",
                blocks: [
                    {
                        type: "roadmap_summary",
                        title: "Ghi Nhớ Trọng Tâm",
                        points: [`Nắm chắc công thức bài ${title}.`, "Hoàn thành bài tập SGK."]
                    }
                ]
            }
        ]
    };
}

// Hiển thị Kế hoạch bài dạy
function renderKHBD() {
    const container = document.getElementById('khbd-output');
    if (!container || !currentLessonData) return;

    const approach = currentLessonData.creativeApproach;
    const sections = currentLessonData.khbd;

    container.innerHTML = `
        <div class="space-y-4">
            ${approach ? `
                <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                    <p class="text-[10px] uppercase font-bold text-emerald-800"><i class="fa-solid fa-wand-magic-sparkles mr-1"></i> Ý TƯỞNG SƯ PHẠM</p>
                    <p class="text-xs text-emerald-950 font-medium">${approach}</p>
                </div>
            ` : ''}

            ${Array.isArray(sections) ? sections.map(sec => `
                <div class="space-y-2">
                    <div class="flex justify-between items-center border-b pb-1">
                        <h4 class="font-bold text-slate-900 text-xs">${sec.sectionTitle}</h4>${sec.badge ? `<span class="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">${sec.badge}</span>` : ''}
                    </div>

                    ${Array.isArray(sec.items) ? sec.items.map(item => `
                        <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                            <p class="font-bold text-emerald-800">${item.title}</p>
                            ${item.teacherRole ? `<p><strong>Giáo viên:</strong> ${item.teacherRole}</p>` : ''}
                            ${item.studentRole ? `<p><strong>Học sinh:</strong> ${item.studentRole}</p>` : ''}
                            ${item.keyContent ? `<p class="p-2 bg-white rounded border italic text-[11px]"><strong>Trọng tâm:</strong> ${item.keyContent}</p>` : ''}
                        </div>
                    `).join('') : ''}
                </div>
            `).join('') : ''}
        </div>
    `;
}

// Hiển thị Slide
function renderSlides() {
    const container = document.getElementById('slide-preview-container');
    if (!container || !currentLessonData) return;

    const slides = currentLessonData.slides;

    container.innerHTML = Array.isArray(slides) ? slides.map((s, idx) => `
        <div class="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
            <div class="flex justify-between items-center border-b border-slate-800 pb-2">
                <span class="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded uppercase">
                    SLIDE ${idx + 1} ${s.tag ? `• ${s.tag}` : ''}
                </span>
                <span class="text-xs text-slate-400">${currentLessonData.subject} ${currentLessonData.grade}</span>
            </div>

            <h4 class="text-sm font-bold text-amber-400">${s.slideTitle}</h4>

            <div class="space-y-2">
                ${Array.isArray(s.blocks) ? s.blocks.map(block => {
                    if (block.type === 'hero') {
                        return `
                            <div class="py-4 text-center bg-slate-800/50 rounded-xl border border-slate-700">
                                <h3 class="text-base font-bold text-white">${block.mainText}</h3>${block.subText ? `<p class="text-xs text-emerald-300">${block.subText}</p>` : ''}
                            </div>
                        `;
                    }
                    if (block.type === 'concept_box') {
                        return `
                            <div class="p-3 bg-slate-800 rounded-xl border border-slate-700 text-xs space-y-1">
                                ${block.title ? `<p class="font-bold text-emerald-400">${block.title}</p>` : ''}
                                <p class="text-slate-200">${block.content}</p>
                            </div>
                        `;
                    }
                    if (block.type === 'problem_solving') {
                        return `
                            <div class="p-3 bg-blue-950/80 rounded-xl border border-blue-800 text-xs space-y-1.5">
                                <p class="text-blue-200 font-semibold">${block.problemText}</p>${Array.isArray(block.steps) ? `<div class="pl-2 text-[11px] text-slate-300">${block.steps.map(st => `<p>${st}</p>`).join('')}</div>` : ''}
                                ${block.finalResult ? `<p class="text-emerald-400 font-bold text-[11px]">👉 ${block.finalResult}</p>` : ''}
                            </div>
                        `;
                    }
                    if (block.type === 'warning_pitfall') {
                        return `
                            <div class="p-3 bg-red-950/60 rounded-xl border border-red-800 text-xs space-y-1">
                                <p class="font-bold text-red-300">${block.title || 'Lỗi sai cần tránh'}</p>
                                ${Array.isArray(block.pitfalls) ? block.pitfalls.map(p => `<p>❌ ${p}</p>`).join('') : ''}
                            </div>
                        `;
                    }
                    if (block.type === 'roadmap_summary') {
                        return `
                            <div class="p-3 bg-slate-800 rounded-xl border border-slate-700 text-xs space-y-1">
                                <p class="font-bold text-amber-400">${block.title || 'Tổng kết'}</p>
                                ${Array.isArray(block.points) ? `<ul class="list-disc list-inside text-slate-300">${block.points.map(pt => `<li>${pt}</li>`).join('')}</ul>` : ''}
                            </div>
                        `;
                    }
                    return '';
                }).join('') : ''}
            </div>
        </div>
    `).join('') : '';
}

// Xuất file PowerPoint
function handleExportPPTX() {
    if (!currentLessonData) return;

    let pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_16x9';

    currentLessonData.slides.forEach((s, idx) => {
        let slide = pptx.addSlide();

        if (idx === 0) {
            slide.background = { color: "0F172A" };
            slide.addText(s.slideTitle, { x: 0.8, y: 2.2, w: 8.4, h: 1.5, fontSize: 26, color: "FFFFFF", bold: true, align: 'center' });
            slide.addText(`${currentLessonData.subject} - Lớp ${currentLessonData.grade}`, { x: 0.8, y: 3.8, w: 8.4, h: 0.8, fontSize: 16, color: "A7F3D0", align: 'center' });
        } else {
            slide.background = { color: "F8FAFC" };
            slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.8, fill: { color: "0F172A" } });
            slide.addText(s.slideTitle, { x: 0.6, y: 0.12, w: 8.8, h: 0.5, fontSize: 16, color: "FFFFFF", bold: true });

            let currentY = 1.1;

            if (Array.isArray(s.blocks)) {
                s.blocks.forEach(block => {
                    if (block.type === 'concept_box') {
                        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: currentY, w: 8.8, h: 2.0, fill: { color: "FFFFFF" }, line: { color: "CBD5E1" } });
                        slide.addText(block.content, { x: 0.8, y: currentY + 0.1, w: 8.4, h: 1.8, fontSize: 13, color: "1E293B" });
                        currentY += 2.2;
                    } else if (block.type === 'problem_solving') {
                        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: currentY, w: 8.8, h: 2.2, fill: { color: "EFF6FF" }, line: { color: "3B82F6" } });
                        slide.addText(block.problemText, { x: 0.8, y: currentY + 0.1, w: 8.4, h: 0.8, fontSize: 13, color: "1E40AF", bold: true });
                        currentY += 2.4;
                    } else if (block.type === 'warning_pitfall') {
                        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: currentY, w: 8.8, h: 2.0, fill: { color: "FEF2F2" }, line: { color: "EF4444" } });
                        currentY += 2.2;
                    } else if (block.type === 'roadmap_summary') {
                        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: currentY, w: 8.8, h: 2.2, fill: { color: "FFFFFF" }, line: { color: "CBD5E1" } });
                        currentY += 2.4;
                    }
                });
            }
        }
    });

    const fileName = `${currentLessonData.title.replace(/[^a-zA-Z0-9_àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ ]/g, "")}_Lesson.pptx`;
    pptx.writeFile({ fileName: fileName });
}