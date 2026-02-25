import { useState } from "react";
import { Search, Bell, Plus, Loader2, Link } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { scrapeUrls } from "@/lib/api";

export function TopBar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground" />
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search your library..."
            className="w-72 pl-9 bg-secondary border-0"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Bell className="h-5 w-5" />
        </Button>
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-sm font-medium text-primary-foreground">
          JD
        </div>
      </div>
    </header>
  );
}

export function FloatingAddButton() {
  const [open, setOpen] = useState(false);
  const [urlText, setUrlText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    const urls = urlText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (urls.length === 0) return;

    setSubmitting(true);
    try {
      const result = await scrapeUrls(urls, "skip");
      toast({
        title: "Scraping complete",
        description: `Processed ${result.posts_processed} post(s), added ${result.added} new recommendation(s).`,
      });
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      setUrlText("");
      setOpen(false);
    } catch (err) {
      toast({
        title: "Scraping failed",
        description: err instanceof Error ? err.message : "Could not process URLs",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-accent text-accent-foreground shadow-lg hover:bg-accent/90"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Add Xiaohongshu URLs
          </DialogTitle>
          <DialogDescription>
            Paste one or more Xiaohongshu URLs (one per line). Each post will be
            scraped and recommendations extracted automatically.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder={"https://www.xiaohongshu.com/explore/...\nhttps://xhslink.com/..."}
          value={urlText}
          onChange={(e) => setUrlText(e.target.value)}
          rows={5}
          disabled={submitting}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || urlText.trim().length === 0}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Scrape & Extract"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
