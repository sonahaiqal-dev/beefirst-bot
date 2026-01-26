// ... (kode atas sama) ...

    // --- 3. AMBIL DATA DARI DATABASE ---
    const customPrompt = userProfile.system_prompt || "Kamu adalah asisten AI yang ramah."
    const knowledgeBase = userProfile.knowledge_base || "" // <-- Ambil data toko
    
    console.log(`🧠 Memproses pesan user...`)

    // RAKIT PROMPT GABUNGAN (RAHASIA KECERDASANNYA DISINI)
    const finalSystemPrompt = `
      INSTRUKSI UTAMA:
      ${customPrompt}

      DATA PENGETAHUAN (FAKTA):
      Gunakan data berikut sebagai satu-satunya sumber kebenaran untuk menjawab pertanyaan user. 
      Jika informasi tidak ada di data ini, jawab dengan sopan bahwa kamu tidak tahu dan tawarkan hubungi admin.
      JANGAN MENGARANG DATA.
      
      === MULAI DATA ===
      ${knowledgeBase}
      === AKHIR DATA ===
    `

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: finalSystemPrompt }, // Kirim prompt gabungan
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5, // Turunkan dikit biar lebih patuh sama data (tidak halu)
      max_tokens: 500,
    })

    // ... (sisa kode bawah sama) ...