import { useState } from "react";
import { MapPin, Clock, DollarSign, X, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";

const travelStyles = ["Budget", "Foodie", "Adventure", "Cultural", "Luxury", "Nature"];

const sampleItinerary = [
  {
    day: 1,
    activities: [
      { time: "Morning", title: "Kinkaku-ji Temple", desc: "Start with Kyoto's iconic Golden Pavilion", duration: "2h", cost: "$5", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=200" },
      { time: "Afternoon", title: "Nishiki Market", desc: "Explore Kyoto's vibrant kitchen street", duration: "3h", cost: "$20", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200" },
    ],
  },
  {
    day: 2,
    activities: [
      { time: "Morning", title: "Fushimi Inari Shrine", desc: "Walk through thousands of vermillion torii gates", duration: "3h", cost: "Free", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=200" },
      { time: "Afternoon", title: "Ramen Ichiran", desc: "Solo ramen dining experience in private booths", duration: "1h", cost: "$12", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200" },
    ],
  },
];

const ItineraryPage = () => {
  const [destination, setDestination] = useState("Kyoto, Japan");
  const [duration, setDuration] = useState([5]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["Cultural", "Foodie"]);

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left panel */}
      <aside className="w-full lg:w-72 shrink-0 space-y-6">
        <div>
          <h3 className="text-sm font-display font-semibold text-foreground mb-2">Destination</h3>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-display font-semibold text-foreground mb-2">
            Trip Duration: {duration[0]} days
          </h3>
          <Slider value={duration} onValueChange={setDuration} min={1} max={14} step={1} />
        </div>

        <div>
          <h3 className="text-sm font-display font-semibold text-foreground mb-3">Travel Style</h3>
          <div className="flex flex-wrap gap-2">
            {travelStyles.map((style) => (
              <Badge
                key={style}
                variant={selectedStyles.includes(style) ? "default" : "secondary"}
                className={`cursor-pointer ${selectedStyles.includes(style) ? "bg-primary text-primary-foreground" : ""}`}
                onClick={() => toggleStyle(style)}
              >
                {style}
              </Badge>
            ))}
          </div>
        </div>

        <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Itinerary
        </Button>
      </aside>

      {/* Right panel — timeline */}
      <div className="flex-1 space-y-6">
        <h2 className="text-xl font-display font-bold text-foreground">Your Itinerary</h2>
        {sampleItinerary.map((day) => (
          <div key={day.day}>
            <h3 className="text-sm font-display font-semibold text-primary mb-3">Day {day.day}</h3>
            <div className="space-y-3 border-l-2 border-primary/20 pl-4 ml-2">
              {day.activities.map((activity) => (
                <Card key={activity.title} className="border-border">
                  <CardContent className="flex gap-4 p-4">
                    <img
                      src={activity.image}
                      alt={activity.title}
                      className="h-16 w-16 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <Badge variant="secondary" className="text-xs mb-1">{activity.time}</Badge>
                      <h4 className="font-display font-semibold text-foreground text-sm">{activity.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{activity.desc}</p>
                      <div className="flex gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" /> {activity.duration}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <DollarSign className="h-3 w-3" /> {activity.cost}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 text-muted-foreground">
                      <X className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItineraryPage;
