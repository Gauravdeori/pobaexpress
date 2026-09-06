import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";
import { RotateCw } from "lucide-react";

export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Periodically check for updates every hour in the background
      if (r) {
        setInterval(() => {
          r.update().catch(() => {});
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error("SW registration error", error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      toast("New Update Available", {
        description: "A new version of Poba Express is ready.",
        duration: Infinity, // Keep toast open until interacted with
        icon: <RotateCw className="size-4 animate-spin text-emerald-500" />,
        action: {
          label: "Refresh Now",
          onClick: () => {
            void updateServiceWorker(true);
          },
        },
        onDismiss: () => {
          setNeedRefresh(false);
        },
      });
    }
  }, [needRefresh, setNeedRefresh, updateServiceWorker]);

  return null; // Component manages side-effects only
}
