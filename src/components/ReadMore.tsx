import React, { useState } from 'react';

interface Props {
  text: string;
  initialLines?: number;
}

const ReadMore: React.FC<Props> = ({ text, initialLines = 3 }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="readmore-wrapper">
      <div
        className={`description${expanded ? ' expanded' : ''}`}
        style={{ WebkitLineClamp: expanded ? 'unset' : initialLines }}
      >
        {text}
      </div>
      <div className="readMore" onClick={() => setExpanded(v => !v)}>
        {expanded ? 'Ver menos' : 'Ler mais'}
      </div>
    </div>
  );
};

export default ReadMore;