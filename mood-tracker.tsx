import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MoodTrackerProps {
  onMoodSelect?: (mood: string, energy: number) => void;
  compact?: boolean;
}

const moods = [
  { emoji: "😊", label: "Excited", energy: 5 },
  { emoji: "🤔", label: "Curious", energy: 4 },
  { emoji: "😌", label: "Content", energy: 3 },
  { emoji: "😐", label: "Neutral", energy: 2 },
  { emoji: "😔", label: "Hesitant", energy: 1 }
];

export default function MoodTracker({ onMoodSelect, compact = false }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const handleMoodSelect = (mood: typeof moods[0]) => {
    setSelectedMood(mood.emoji);
    onMoodSelect?.(mood.label, mood.energy);
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <span className="text-sm text-gray-600 dark:text-gray-300">How are you feeling about shopping today?</span>
        <div className="flex space-x-1">
          {moods.map((mood) => (
            <Button
              key={mood.emoji}
              variant="ghost"
              size="sm"
              onClick={() => handleMoodSelect(mood)}
              className={`p-1 h-8 w-8 rounded-full transition-all ${
                selectedMood === mood.emoji 
                  ? "bg-blue-200 dark:bg-blue-700 scale-110" 
                  : "hover:bg-blue-100 dark:hover:bg-blue-800"
              }`}
            >
              <span className="text-lg">{mood.emoji}</span>
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          How are you feeling about shopping today?
        </h3>
        
        <div className="grid grid-cols-5 gap-3">
          {moods.map((mood) => (
            <Button
              key={mood.emoji}
              variant="ghost"
              onClick={() => handleMoodSelect(mood)}
              className={`flex flex-col items-center p-4 h-auto transition-all ${
                selectedMood === mood.emoji 
                  ? "bg-blue-100 dark:bg-blue-900 border-2 border-blue-500 scale-105" 
                  : "hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <span className="text-3xl mb-2">{mood.emoji}</span>
              <span className="text-xs text-gray-600 dark:text-gray-300">{mood.label}</span>
            </Button>
          ))}
        </div>

        {selectedMood && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">
              Great! We'll show you purchase options that match your current shopping mood.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Hook to track mood over time
export function useMoodTracking() {
  const [currentMood, setCurrentMood] = useState<{ mood: string; energy: number; timestamp: Date } | null>(null);

  const recordMood = (mood: string, energy: number) => {
    const moodEntry = {
      mood,
      energy,
      timestamp: new Date()
    };
    
    setCurrentMood(moodEntry);
    
    // Store in localStorage for persistence
    localStorage.setItem("optibuy_current_mood", JSON.stringify(moodEntry));
  };

  const getMoodRecommendations = () => {
    if (!currentMood) return [];

    // Simple mood-based recommendations
    switch (currentMood.energy) {
      case 5: // Excited
        return ["premium", "trending", "limited-time"];
      case 4: // Curious
        return ["new-arrivals", "unique", "innovative"];
      case 3: // Content
        return ["popular", "reliable", "value"];
      case 2: // Neutral
        return ["bestsellers", "basic", "practical"];
      case 1: // Hesitant
        return ["budget-friendly", "safe-choices", "well-reviewed"];
      default:
        return ["popular"];
    }
  };

  return {
    currentMood,
    recordMood,
    getMoodRecommendations
  };
}
