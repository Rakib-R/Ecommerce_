import React, { FC } from "react";
import { HalfStar, StarFilled, StarOutline } from './star_rankings';

type Props = {
  rating: number;
};

const Ratings: FC<Props> = ({ rating }) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(<StarFilled key={i} />);
    } else if (i - 0.5 === rating) {
      stars.push(<HalfStar key={i} />);
    } else {
      stars.push(<StarOutline key={i} />);
    }
  }

  return <div className="flex gap-1">{stars}</div>;
};

export default Ratings;