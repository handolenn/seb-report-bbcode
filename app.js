document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const sebForm = document.getElementById('sebForm');
    const inputTarih = document.getElementById('inputTarih');
    const inputAktivasyonNo = document.getElementById('inputAktivasyonNo');
    const inputKonum = document.getElementById('inputKonum');
    const inputOlayTipi = document.getElementById('inputOlayTipi');
    const inputIstasyon = document.getElementById('inputIstasyon');
    const inputYetkili = document.getElementById('inputYetkili');
    const inputOlayKomutan = document.getElementById('inputOlayKomutan');
    const inputTakimKomutan = document.getElementById('inputTakimKomutan');
    const inputTakimLider = document.getElementById('inputTakimLider');
    const mudahalePersonelContainer = document.getElementById('mudahalePersonelContainer');
    const inputDetaylar = document.getElementById('inputDetaylar');
    
    const btnAddPersonel = document.getElementById('btnAddPersonel');
    const btnClearForm = document.getElementById('btnClearForm');
    const btnCopy = document.getElementById('btnCopy');
    const btnSaveReport = document.getElementById('btnSaveReport');
    
    const btnOpenSavedReports = document.getElementById('btnOpenSavedReports');
    const savedReportsModal = document.getElementById('savedReportsModal');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const savedReportsList = document.getElementById('savedReportsList');
    const savedCountBadge = document.getElementById('savedCount');
    
    const cookieBanner = document.getElementById('cookieBanner');
    const btnAcceptCookies = document.getElementById('btnAcceptCookies');

    const bbcodeOutput = document.getElementById('bbcodeOutput');
    const previewRender = document.getElementById('previewRender');
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');

    // Default Date to Today (DD.MM.YYYY)
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
    inputTarih.value = formattedDate;

    // Cookie Banner Check
    if (!localStorage.getItem('seb_cookie_accepted')) {
        setTimeout(() => {
            cookieBanner.classList.add('show');
        }, 600);
    }

    btnAcceptCookies.addEventListener('click', () => {
        localStorage.setItem('seb_cookie_accepted', 'true');
        cookieBanner.classList.remove('show');
    });

    // Personnel list tracker
    let personelIndex = 0;

    // Function to add dynamic personel row
    function addPersonelField(value = '') {
        personelIndex++;
        const currentId = personelIndex;
        
        const row = document.createElement('div');
        row.className = 'personel-row';
        row.id = `personelRow_${currentId}`;

        row.innerHTML = `
            <div class="form-group">
                <label for="inputMudahale_${currentId}"><i class="fas fa-user"></i> MÜDAHALE EDEN PERSONEL ${currentId}</label>
                <input type="text" id="inputMudahale_${currentId}" class="input-personel" placeholder="Deputy Ad Soyad" value="${value}">
            </div>
            <button type="button" class="btn-icon-danger btn-remove-personel" data-id="${currentId}" title="Personeli Kaldır">
                <i class="fas fa-trash"></i>
            </button>
        `;

        mudahalePersonelContainer.appendChild(row);

        // Bind input event to newly created field
        const newInput = row.querySelector('.input-personel');
        newInput.addEventListener('input', generateBBCode);

        // Bind remove button
        const removeBtn = row.querySelector('.btn-remove-personel');
        removeBtn.addEventListener('click', () => {
            row.remove();
            reindexPersonelFields();
            generateBBCode();
        });

        generateBBCode();
    }

    // Re-index personnel labels and IDs after removal
    function reindexPersonelFields() {
        const rows = mudahalePersonelContainer.querySelectorAll('.personel-row');
        personelIndex = 0;
        rows.forEach((row, idx) => {
            personelIndex = idx + 1;
            row.id = `personelRow_${personelIndex}`;
            
            const label = row.querySelector('label');
            const input = row.querySelector('input');
            const btn = row.querySelector('.btn-remove-personel');
            
            label.setAttribute('for', `inputMudahale_${personelIndex}`);
            label.innerHTML = `<i class="fas fa-user"></i> MÜDAHALE EDEN PERSONEL ${personelIndex}`;
            input.id = `inputMudahale_${personelIndex}`;
            btn.setAttribute('data-id', personelIndex);
        });
    }

    // Add initial personel field
    addPersonelField();

    // Event listener for "+ Personel Ekle" button
    btnAddPersonel.addEventListener('click', () => {
        addPersonelField();
    });

    // Form inputs listener for live generator
    sebForm.addEventListener('input', generateBBCode);

    // BBCode Generation Logic matching exact PHP template
    function generateBBCode() {
        const tarih = inputTarih.value.trim();
        const aktivasyon = inputAktivasyonNo.value.trim();
        const konum = inputKonum.value.trim();
        const olayTipi = inputOlayTipi.value.trim();
        const istasyon = inputIstasyon.value.trim();
        const yetkili = inputYetkili.value.trim();

        const olayKomutan = inputOlayKomutan.value.trim();
        const takimKomutan = inputTakimKomutan.value.trim();
        const takimLider = inputTakimLider.value.trim();

        // Gather personnel entries
        const personelInputs = mudahalePersonelContainer.querySelectorAll('.input-personel');
        let personelListBBCodeArray = [];
        let personelListHTMLArray = [];

        personelInputs.forEach((input) => {
            const val = input.value.trim();
            if (val) {
                personelListBBCodeArray.push(`[*]${val}`);
                personelListHTMLArray.push(`<li>${escapeHtml(val)}</li>`);
            }
        });

        let mudahalePersonelListBBCode = personelListBBCodeArray.length > 0
            ? '\n' + personelListBBCodeArray.join('\n') + '\n'
            : '[*]Deputy Ad Soyad\n';

        let mudahalePersonelListHTML = personelListHTMLArray.length > 0
            ? personelListHTMLArray.join('')
            : '<li>Deputy Ad Soyad</li>';

        const detaylar = inputDetaylar.value.trim();

        // Exact BBCode Template from PHP
        const bbcode = `[hr][/hr]
[center][b][size=125]LOS SANTOS COUNTY SHERIFF'S DEPARTMENT
SPECIAL ENFORCEMENT BUREAU[/size][/b]
[size=110]SPECIAL WEAPONS TEAM INCIDENT LOG[/size][/center]
[hr][/hr]
[divbox=black][color=white][b][center]OLAY BİLGİLERİ[/center][/b][/color][/divbox]
[table=Arial][tr]
[td][b]TARİH & SAAT:[/b][/td]
[td][b]S.E.B. AKTİVASYON NO.:[/b][/td]
[td][b]YER:[/b][/td]
[/tr]
[tr]
[td]${tarih}[/td]
[td]${aktivasyon}[/td]
[td]${konum}[/td]
[/tr]
[tr]
[td][b]OLAY TİPİ:[/b][/td]
[td][b]TALEP EDEN İSTASYON/BİRİM:[/b][/td]
[td][b]YETKİLİ OLAN:[/b][/td]
[/tr]
[tr]
[td]${olayTipi}[/td]
[td]${istasyon}[/td]
[td]${yetkili}[/td]
[/tr][/table]
[divbox=black][color=white][b][center]PERSONEL[/center][/b][/color][/divbox]
[divbox=white][center][size=85][b]PERSONEL KAYDI[/b][/size][/center]
[size=85][u][b]ALAN/SEB KOMUTASI[/b][/u]
[list][*][b]Olay Komutanı:[/b] ${olayKomutan}
[*][b]Takım Komutanı:[/b] ${takimKomutan}
[*][b]Takım Lideri:[/b] ${takimLider}[/list]
[u][b]MÜDAHALE EDEN PERSONEL[/b][/u]
[list]${mudahalePersonelListBBCode}[/list][/size]
[/divbox]
[divbox=black][color=white][b][center]ANLATIM[/center][/b][/color][/divbox]
[divbox=white][center][size=85][b]OLAY ANLATIMI VE DIŞ REFERANSLAR[/b][/size][/center]
[size=85]${detaylar}
[/size][/divbox]`;

        // Output to BBCode Textarea
        bbcodeOutput.value = bbcode;

        // Render Forum-like HTML Preview matching exact [divbox=black] and [divbox=white] BBCode
        previewRender.innerHTML = `
            <div style="font-family: Arial, sans-serif; background:#ffffff; color:#000000; padding:24px; border-radius:4px; font-size:16px; line-height:1.6;">
                <hr style="border:0; border-top:2px solid #000000; margin:14px 0;">
                <div style="text-align:center;">
                    <strong style="font-size:140%; letter-spacing:0.5px; color:#000000;">LOS SANTOS COUNTY SHERIFF'S DEPARTMENT<br>SPECIAL ENFORCEMENT BUREAU</strong><br>
                    <span style="font-size:120%; font-weight:bold; display:inline-block; margin-top:4px; color:#000000;">SPECIAL WEAPONS TEAM INCIDENT LOG</span>
                </div>
                <hr style="border:0; border-top:2px solid #000000; margin:14px 0;">
                
                <!-- [divbox=black][color=white][b][center]OLAY BİLGİLERİ[/center][/b][/color][/divbox] -->
                <div style="background:#000000; color:#ffffff; font-weight:bold; text-align:center; padding:10px; font-size:1.1rem; letter-spacing:1px; margin-bottom:10px;">
                    OLAY BİLGİLERİ
                </div>

                <!-- [table=Arial] -->
                <table style="width:100%; border-collapse:collapse; font-size:1rem; margin-bottom:16px; border:1px solid #000000; background:#ffffff;" cellpadding="10" cellspacing="0">
                    <tr style="background:#ffffff; font-weight:bold; color:#000000;">
                        <td style="border:1px solid #000000; width:33%;">TARİH & SAAT:</td>
                        <td style="border:1px solid #000000; width:33%;">S.E.B. AKTİVASYON NO.:</td>
                        <td style="border:1px solid #000000; width:34%;">YER:</td>
                    </tr>
                    <tr style="color:#000000;">
                        <td style="border:1px solid #000000;">${escapeHtml(tarih)}</td>
                        <td style="border:1px solid #000000;">${escapeHtml(aktivasyon)}</td>
                        <td style="border:1px solid #000000;">${escapeHtml(konum)}</td>
                    </tr>
                    <tr style="background:#ffffff; font-weight:bold; color:#000000;">
                        <td style="border:1px solid #000000;">OLAY TİPİ:</td>
                        <td style="border:1px solid #000000;">TALEP EDEN İSTASYON/BİRİM:</td>
                        <td style="border:1px solid #000000;">YETKİLİ OLAN:</td>
                    </tr>
                    <tr style="color:#000000;">
                        <td style="border:1px solid #000000;">${escapeHtml(olayTipi)}</td>
                        <td style="border:1px solid #000000;">${escapeHtml(istasyon)}</td>
                        <td style="border:1px solid #000000;">${escapeHtml(yetkili)}</td>
                    </tr>
                </table>

                <!-- [divbox=black][color=white][b][center]PERSONEL[/center][/b][/color][/divbox] -->
                <div style="background:#000000; color:#ffffff; font-weight:bold; text-align:center; padding:10px; font-size:1.1rem; letter-spacing:1px;">
                    PERSONEL
                </div>
                <!-- [divbox=white] -->
                <div style="background:#ffffff; color:#000000; border:1px solid #000000; border-top:none; padding:16px; font-size:1rem;">
                    <div style="text-align:center; font-weight:bold; font-size:1.1rem; margin-bottom:10px;">PERSONEL KAYDI</div>
                    <u><strong style="font-size:1.05rem;">ALAN/SEB KOMUTASI</strong></u>
                    <ul style="margin:8px 0 14px 24px; line-height:1.7;">
                        <li><strong>Olay Komutanı:</strong> ${escapeHtml(olayKomutan)}</li>
                        <li><strong>Takım Komutanı:</strong> ${escapeHtml(takimKomutan)}</li>
                        <li><strong>Takım Lideri:</strong> ${escapeHtml(takimLider)}</li>
                    </ul>
                    <u><strong style="font-size:1.05rem;">MÜDAHALE EDEN PERSONEL</strong></u>
                    <ul style="margin:8px 0 0 24px; line-height:1.7;">
                        ${mudahalePersonelListHTML}
                    </ul>
                </div>

                <!-- [divbox=black][color=white][b][center]ANLATIM[/center][/b][/color][/divbox] -->
                <div style="background:#000000; color:#ffffff; font-weight:bold; text-align:center; padding:10px; font-size:1.1rem; letter-spacing:1px; margin-top:16px;">
                    ANLATIM
                </div>
                <!-- [divbox=white] -->
                <div style="background:#ffffff; color:#000000; border:1px solid #000000; border-top:none; padding:16px; font-size:1rem;">
                    <div style="text-align:center; font-weight:bold; font-size:1.1rem; margin-bottom:10px;">OLAY ANLATIMI VE DIŞ REFERANSLAR</div>
                    <div style="white-space: pre-wrap; line-height:1.7;">${escapeHtml(detaylar)}</div>
                </div>
            </div>
        `;
    }

    // Helper: HTML Escape
    function escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Copy to Clipboard
    btnCopy.addEventListener('click', () => {
        if (!bbcodeOutput.value) return;
        
        navigator.clipboard.writeText(bbcodeOutput.value).then(() => {
            showToast('BBCode başarıyla panoya kopyalandı!');
        }).catch(err => {
            bbcodeOutput.select();
            document.execCommand('copy');
            showToast('BBCode kopyalandı!');
        });
    });

    // Save Report to LocalStorage / Cookies
    function getSavedReports() {
        try {
            return JSON.parse(localStorage.getItem('seb_saved_reports')) || [];
        } catch(e) {
            return [];
        }
    }

    function updateSavedCount() {
        const reports = getSavedReports();
        savedCountBadge.textContent = reports.length;
    }

    btnSaveReport.addEventListener('click', () => {
        const personelInputs = mudahalePersonelContainer.querySelectorAll('.input-personel');
        const personelVals = [];
        personelInputs.forEach(inp => {
            if (inp.value.trim()) personelVals.push(inp.value.trim());
        });

        const reportData = {
            id: Date.now(),
            savedAt: new Date().toLocaleString('tr-TR'),
            tarih: inputTarih.value.trim(),
            aktivasyonNo: inputAktivasyonNo.value.trim(),
            konum: inputKonum.value.trim(),
            olayTipi: inputOlayTipi.value.trim(),
            istasyon: inputIstasyon.value.trim(),
            yetkili: inputYetkili.value.trim(),
            olayKomutan: inputOlayKomutan.value.trim(),
            takimKomutan: inputTakimKomutan.value.trim(),
            takimLider: inputTakimLider.value.trim(),
            personelList: personelVals,
            detaylar: inputDetaylar.value.trim()
        };

        const reports = getSavedReports();
        reports.unshift(reportData);
        localStorage.setItem('seb_saved_reports', JSON.stringify(reports));

        updateSavedCount();
        showToast('Rapor çerezlere/hafızaya başarıyla kaydedildi!');
    });

    // Render Saved Reports Modal List
    function renderSavedReportsModal() {
        const reports = getSavedReports();
        updateSavedCount();

        if (reports.length === 0) {
            savedReportsList.innerHTML = `
                <div style="text-align:center; color:#94a3b8; padding:30px 0;">
                    <i class="fas fa-folder-open" style="font-size:2.5rem; margin-bottom:10px; opacity:0.5;"></i>
                    <p>Henüz kaydedilmiş bir rapor bulunmuyor.</p>
                </div>
            `;
            return;
        }

        savedReportsList.innerHTML = '';
        reports.forEach(rpt => {
            const item = document.createElement('div');
            item.className = 'saved-report-item';

            const titleText = rpt.aktivasyonNo ? `S.E.B. AKTİVASYON: ${rpt.aktivasyonNo}` : 'İsimsiz Rapor';
            const subText = `${rpt.tarih || 'Tarih Yok'} • ${rpt.olayTipi || 'Olay Tipi Yok'}`;

            item.innerHTML = `
                <div class="report-info">
                    <h4>${escapeHtml(titleText)}</h4>
                    <p>${escapeHtml(subText)}</p>
                    <p style="font-size:0.75rem; color:#94a3b8; margin-top:2px;">Kayıt Tarihi: ${rpt.savedAt}</p>
                </div>
                <div class="report-item-actions">
                    <button type="button" class="btn btn-primary btn-sm btn-load-report" data-id="${rpt.id}">
                        <i class="fas fa-edit"></i> Yükle / Düzenle
                    </button>
                    <button type="button" class="btn btn-danger-outline btn-sm btn-delete-report" data-id="${rpt.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            savedReportsList.appendChild(item);
        });

        // Bind Load Buttons
        savedReportsList.querySelectorAll('.btn-load-report').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                loadReportToForm(id);
            });
        });

        // Bind Delete Buttons
        savedReportsList.querySelectorAll('.btn-delete-report').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                deleteReport(id);
            });
        });
    }

    // Load report data into form
    function loadReportToForm(id) {
        const reports = getSavedReports();
        const rpt = reports.find(r => r.id === id);
        if (!rpt) return;

        inputTarih.value = rpt.tarih || formattedDate;
        inputAktivasyonNo.value = rpt.aktivasyonNo || '';
        inputKonum.value = rpt.konum || '';
        inputOlayTipi.value = rpt.olayTipi || '';
        inputIstasyon.value = rpt.istasyon || '';
        inputYetkili.value = rpt.yetkili || '';
        inputOlayKomutan.value = rpt.olayKomutan || '';
        inputTakimKomutan.value = rpt.takimKomutan || '';
        inputTakimLider.value = rpt.takimLider || '';
        inputDetaylar.value = rpt.detaylar || '';

        // Rebuild personel fields
        mudahalePersonelContainer.innerHTML = '';
        personelIndex = 0;

        if (rpt.personelList && rpt.personelList.length > 0) {
            rpt.personelList.forEach(pName => {
                addPersonelField(pName);
            });
        } else {
            addPersonelField();
        }

        generateBBCode();
        savedReportsModal.classList.remove('active');
        showToast('Rapor forma yüklendi, düzenleyebilirsiniz!');
    }

    // Delete report
    function deleteReport(id) {
        let reports = getSavedReports();
        reports = reports.filter(r => r.id !== id);
        localStorage.setItem('seb_saved_reports', JSON.stringify(reports));
        renderSavedReportsModal();
        showToast('Rapor silindi.');
    }

    // Open/Close Modal Handlers
    btnOpenSavedReports.addEventListener('click', () => {
        renderSavedReportsModal();
        savedReportsModal.classList.add('active');
    });

    btnCloseModal.addEventListener('click', () => {
        savedReportsModal.classList.remove('active');
    });

    savedReportsModal.addEventListener('click', (e) => {
        if (e.target === savedReportsModal) {
            savedReportsModal.classList.remove('active');
        }
    });

    // Toast Notification Handler
    function showToast(message) {
        toastMsg.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Tab Switcher
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            if (targetTab === 'bbcode') {
                document.getElementById('tabBbcode').classList.add('active');
            } else if (targetTab === 'preview') {
                document.getElementById('tabPreview').classList.add('active');
            }
        });
    });

    // Clear Form Button
    btnClearForm.addEventListener('click', () => {
        if (confirm('Tüm form verilerini temizlemek istediğinize emin misiniz?')) {
            sebForm.reset();
            inputTarih.value = formattedDate;
            mudahalePersonelContainer.innerHTML = '';
            personelIndex = 0;
            addPersonelField();
            generateBBCode();
            showToast('Form temizlendi.');
        }
    });

    // Initial count update
    updateSavedCount();
    generateBBCode();
});
