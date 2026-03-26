import { NextResponse } from "next/server";

export async function POST() {
    const COOKIE = process.env.TB_COOKIE;
    const PUB = process.env.TB_PUB;

    if (!COOKIE || !PUB) {
        return NextResponse.json({ error: "Missing TB_COOKIE or TB_PUB" }, { status: 500 });
    }

    async function sendNotification(message) {
        try {
            await fetch("https://ntfy.sh/eternaL-impact-messages-2468", {
                method: "POST",
                body: message,
            });
        } catch (error) {
            console.log("⚠️ Notification failed:", error);
        }
    }

    try {
        const res = await fetch("https://timebucks.com/publishers/lib/scripts/php/daily_streak_actions.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                Cookie: COOKIE,
                Origin: "https://timebucks.com",
                Referer: "https://timebucks.com/publishers/index.php?pg=earn&tab=daily_streak",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
                "X-Requested-With": "XMLHttpRequest",
                Accept: "application/json, text/javascript, */*; q=0.01",
                "Accept-Language": "en-US,en;q=0.9",
            },
            body: new URLSearchParams({ action: "check_in", pub: PUB }).toString(),
        });

        const json = await res.json();
        console.log(json);
        

        if (json.success || json.status === "success") {
            await sendNotification(`🎉 TimeBucks check-in successful! Streak maintained! Credited Amount ${json.credited_amount}$, Streak ${json.new_streak} days.`);
            return NextResponse.json({ success: true, message: "Check-in successful!" });
        } else if (json.error && json.error.includes("Cooldown")) {
            await sendNotification("⏳ TimeBucks: Already checked in. Cooldown active.");
            return NextResponse.json({ success: false, message: "Cooldown active" });
        } else {
            await sendNotification(`⚠️ TimeBucks check-in issue: ${json.error || "Unknown error"}`);
            return NextResponse.json({ success: false, message: json.error }, { status: 400 });
        }
    } catch (error) {
        await sendNotification(`❌ TimeBucks check-in FAILED: ${error.message}`);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}