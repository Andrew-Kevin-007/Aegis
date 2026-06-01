"use client";

import { useEffect, useRef } from "react";
import "driver.js/dist/driver.css";

export default function ContextualTour() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const toured = localStorage.getItem("aegis_tour_v2");
    if (toured) return;

    // Dynamic import so the heavy lib only loads for new users
    import("driver.js").then(({ driver }) => {
      const driverObj = driver({
        animate: true,
        smoothScroll: true,
        allowClose: true,
        overlayOpacity: 0.75,
        stagePadding: 8,
        stageRadius: 12,
        popoverClass: "aegis-driver-popover",
        onDestroyed: () => {
          localStorage.setItem("aegis_tour_v2", "true");
        },
        steps: [
          {
            element: "#dashboard-exposure-hero",
            popover: {
              title: "Your Total Exposure",
              description:
                "This is your live BNPL liability — every outstanding balance aggregated in real-time. The colour shifts: green is safe, amber is moderate, red is high risk. FCA regulations from July 15 mean this number directly impacts your credit file.",
              side: "bottom",
              align: "center",
            },
          },
          {
            element: "#dashboard-health-score",
            popover: {
              title: "Your Aegis Health Score",
              description:
                "A proprietary 0–100 score calculated daily from your payment behaviour, streak, and liability ratio. This is your primary metric — aim for 90+. It updates every time you settle a payment.",
              side: "bottom",
              align: "start",
            },
          },
          {
            element: "#dashboard-kat-companion",
            popover: {
              title: "Meet Your Debt Companion",
              description:
                "Your Aegis Kat reflects your financial health. Settle payments on time to level them up — from Kitten all the way to Legend. Overdue payments trigger a stressed animation. Keep your kat happy.",
              side: "right",
              align: "center",
            },
          },
          {
            element: "#dashboard-active-tab",
            popover: {
              title: "Active Liabilities — Sorted by Urgency",
              description:
                "Overdue items always surface at the top. Each row shows the FICO impact if you miss it. Click Settle once you have paid to update your dashboard and increment your streak.",
              side: "top",
              align: "start",
            },
          },
          {
            element: "#dashboard-scan-button",
            popover: {
              title: "Scan a Screenshot — Do It Now",
              description:
                "Open Klarna, Afterpay, or Clearpay — take a screenshot — tap Scan. Our AI reads every payment in under 3 seconds. Try it right now to complete setup.",
              side: "bottom",
              align: "end",
              onNextClick: () => {
                // Mark tour done and navigate to scan
                localStorage.setItem("aegis_tour_v2", "true");
                driverObj.destroy();
                (document.getElementById("dashboard-scan-button") as HTMLButtonElement | null)?.click();
              },
            },
          },
        ],
      });

      // Small delay so elements render before spotlight fires
      setTimeout(() => driverObj.drive(), 800);
    });
  }, []);

  return null;
}
