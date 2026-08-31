import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Star, MessageSquare } from 'lucide-react';
import { TextField } from '@mui/material';
import Button from 'shared/Button';

const Feedback: React.FC = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }

    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success('Thank you for your feedback!');
    setIsSubmitting(false);
    setRating(0);
    setComments('');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center flex flex-col items-center">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
          <MessageSquare className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">How did we do?</h1>
        <p className="text-gray-500 mt-2 text-sm max-w-sm">
          Your feedback helps us improve our service and delivery experience.
          Please rate your overall experience with Bonite B2B.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-4">
            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Overall Rating
            </span>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-12 h-12 transition-colors duration-200 ${
                      (hoverRating || rating) >= star
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="h-4">
              {rating > 0 && (
                <span className="text-sm font-medium text-blue-600">
                  {
                    ['Terrible', 'Poor', 'Average', 'Good', 'Excellent'][
                      rating - 1
                    ]
                  }
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Any additional comments or suggestions?
            </label>
            <TextField
              multiline
              rows={4}
              placeholder="Tell us what you liked or what we can improve..."
              value={comments}
              onChange={e => setComments(e.target.value)}
              fullWidth
              className="bg-gray-50"
            />
          </div>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            loading={isSubmitting}
            className="w-full justify-center"
          >
            Submit Feedback
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
