import React from "react";

import { FormatDuration } from '../../utils/FormatDuration/FormatDuration'

type Track = {
  title: string;
  artist_name: string;
  duration: number;
  genre?: string;
  release_year?: number;
  likes?: number;
  track_picture?: string;
};

type TrackInfoPanelProps = {
  track: Track;
  onClose: () => void;
};

const defaultImage = "/api/placeholder/100/100";

export const TrackInfo: React.FC<TrackInfoPanelProps> = ({
  track,
  onClose,
}) => {
  return (
    <div className="absolute bottom-24 right-4 w-80 bg-[#1A181F] rounded-lg shadow-lg p-4 z-50 border border-[#36343F]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold">Информация о треке</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
      <div className="flex items-center mb-4">
        <img
          src={
            track.track_picture
              ? `data:image/jpeg;base64,${track.track_picture}`
              : defaultImage
          }
          alt="Track cover"
          className="w-16 h-16 rounded mr-4 object-cover"
        />
        <div>
          <div className="text-white font-medium">{track.title}</div>
          <div className="text-gray-400 text-sm">{track.artist_name}</div>
        </div>
      </div>
      <div className="text-gray-400 text-sm space-y-2">
        <div className="flex justify-between">
          <span>Длительность:</span>
          <span>{FormatDuration(track.duration)}</span>
        </div>
        <div className="flex justify-between">
          <span>Жанр:</span>
          <span>{track.genre || "Не указан"}</span>
        </div>
        <div className="flex justify-between">
          <span>Автор:</span>
          <span>{track.artist_name || "Не указан"}</span>
        </div>
        <div className="flex justify-between">
          <span>Год выпуска:</span>
          <span>{track.release_year || "Не указан"}</span>
        </div>
        <div className="flex justify-between">
          <span>Лайки:</span>
          <span>{track.likes || 0}</span>
        </div>
      </div>
    </div>
  );
};
