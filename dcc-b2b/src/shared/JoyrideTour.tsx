import React from 'react';
import { Joyride, type EventData, STATUS } from 'react-joyride';
import { useTour } from '../context/TourContext';

const JoyrideTour: React.FC = () => {
  const { run, steps, stopTour } = useTour();

  const handleJoyrideCallback = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      stopTour();
    }
  };

  return (
    <Joyride
      onEvent={handleJoyrideCallback}
      continuous
      run={run}
      scrollToFirstStep
      steps={steps}
      floatingOptions={{
        shiftOptions: { padding: 20 },
        flipOptions: { padding: 20 },
      }}
      options={{
        zIndex: 10000,
        primaryColor: '#3b82f6',
        showProgress: true,
        buttons: ['close', 'primary', 'skip'],
      }}
    />
  );
};

export default JoyrideTour;
