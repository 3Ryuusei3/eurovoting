import { supabase } from '@/lib/supabase';
import { UserAnswer, RoomQuestionWithDetails } from '@/types/Question';

/**
 * Get all questions for a room
 * @param roomId - The room ID
 * @returns An array of room questions with their details
 */
export async function getRoomQuestions(roomId: string): Promise<RoomQuestionWithDetails[]> {
  if (!roomId) {
    return [];
  }

  try {
    console.log('Fetching questions for room:', roomId);

    // Use the Supabase function to get room questions with their answers
    const { data, error } = await supabase
      .rpc('get_room_questions', { room_id_param: parseInt(roomId, 10) });

    if (error) {
      console.error('Error calling get_room_questions function:', error);
      throw error;
    }

    console.log('Room questions data:', data);

    return data || [];
  } catch (error) {
    console.error('Error in getRoomQuestions:', error);
    throw error;
  }
}

/**
 * Update the state of a room question
 * @param roomQuestionId - The room question ID
 * @param state - The new state
 */
export async function updateRoomQuestionState(roomQuestionId: string, state: string): Promise<void> {
  if (!roomQuestionId) {
    throw new Error('Room question ID is required');
  }

  try {
    console.log(`questions.ts: Updating room question ${roomQuestionId} state to ${state}`);

    const { data, error } = await supabase
      .from('room_questions')
      .update({ state, updated_at: new Date().toISOString() })
      .eq('id', parseInt(roomQuestionId, 10))
      .select();

    if (error) {
      console.error('Error updating room question state:', error);
      throw error;
    }

    console.log(`questions.ts: Room question ${roomQuestionId} state updated successfully:`, data);
  } catch (error) {
    console.error('Error in updateRoomQuestionState:', error);
    throw error;
  }
}

/**
 * Submit a user's answer to a question
 * @param userId - The user ID
 * @param roomId - The room ID
 * @param questionId - The question ID
 * @param answerId - The answer ID
 */
export async function submitUserAnswer(
  userId: string,
  roomId: string,
  questionId: string,
  answerId: string
): Promise<void> {
  if (!userId || !roomId || !questionId || !answerId) {
    throw new Error('All parameters are required');
  }

  try {
    // Use the Supabase function to submit the user answer
    const { data, error } = await supabase
      .rpc('submit_user_answer', {
        user_id_param: parseInt(userId, 10),
        room_id_param: parseInt(roomId, 10),
        question_id_param: parseInt(questionId, 10),
        answer_id_param: parseInt(answerId, 10)
      });

    if (error) {
      console.error('Error calling submit_user_answer function:', error);
      throw error;
    }

    console.log('User answer submitted:', data);
  } catch (error) {
    console.error('Error in submitUserAnswer:', error);
    throw error;
  }
}

/**
 * Get a user's answer to a question
 * @param userId - The user ID
 * @param roomId - The room ID
 * @param questionId - The question ID
 * @returns The user's answer or null if not found
 */
export async function getUserAnswer(
  userId: string,
  roomId: string,
  questionId: string
): Promise<UserAnswer | null> {
  if (!userId || !roomId || !questionId) {
    return null;
  }

  try {
    // Get all user answers for the room
    const { data, error } = await supabase
      .rpc('get_user_answers_for_room', {
        user_id_param: parseInt(userId, 10),
        room_id_param: parseInt(roomId, 10)
      });

    if (error) {
      console.error('Error calling get_user_answers_for_room function:', error);
      throw error;
    }

    // Find the answer for the specific question
    const answer = data?.find((a: UserAnswer) => a.question_id === parseInt(questionId, 10));

    return answer || null;
  } catch (error) {
    console.error('Error in getUserAnswer:', error);
    throw error;
  }
}

/**
 * Get all user answers for a question in a room
 * @param roomId - The room ID
 * @param questionId - The question ID
 * @returns An array of user answers
 */
export async function getQuestionUserAnswers(
  roomId: string,
  questionId: string
): Promise<UserAnswer[]> {
  if (!roomId || !questionId) {
    return [];
  }

  try {
    // Use the Supabase function to get all user answers for a question
    const { data, error } = await supabase
      .rpc('get_question_user_answers', {
        room_id_param: parseInt(roomId, 10),
        question_id_param: parseInt(questionId, 10)
      });

    if (error) {
      console.error('Error calling get_question_user_answers function:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getQuestionUserAnswers:', error);
    throw error;
  }
}
