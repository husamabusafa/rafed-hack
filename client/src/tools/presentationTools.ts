type SetState<T> = (updater: T | ((prev: T) => T)) => void;

export interface Slide {
  image: string;
  title: string;
}

export interface PresentationState {
  slides: Slide[];
  metadata: {
    createdAt: string;
    updatedAt?: string;
  };
}

export interface ToolResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: unknown;
}

const EMPTY_PRESENTATION: PresentationState = {
  slides: [],
  metadata: {
    createdAt: new Date().toISOString(),
  },
};

export const createPresentationTools = (
  getPresentationState: () => PresentationState,
  setPresentationState: SetState<PresentationState>
) => {
  return {
    /**
     * Set presentation slides
     * Tool Name: set_presentation_slides
     * Description: Sets the presentation slides with images and titles. Each slide contains an image URL and a title. Use this after generating or preparing presentation images.
     * Input Schema:
     * {
     *   "type": "object",
     *   "properties": {
     *     "slides": {
     *       "type": "array",
     *       "description": "Array of presentation slides",
     *       "items": {
     *         "type": "object",
     *         "properties": {
     *           "image": {
     *             "type": "string",
     *             "description": "URL or path to the slide image"
     *           },
     *           "title": {
     *             "type": "string",
     *             "description": "Title of the slide"
     *           }
     *         },
     *         "required": ["image", "title"]
     *       }
     *     }
     *   },
     *   "required": ["slides"]
     * }
     */
    set_presentation_slides: async (input: unknown): Promise<ToolResponse> => {
      try {
        const params = input as { slides?: Slide[] };
        if (!Array.isArray(params.slides)) {
          return {
            success: false,
            error: 'slides must be an array',
          };
        }

        // Validate slides
        for (let i = 0; i < params.slides.length; i++) {
          const slide = params.slides[i];
          if (!slide.image || typeof slide.image !== 'string') {
            return {
              success: false,
              error: `Slide ${i + 1}: image is required and must be a string`,
            };
          }
          if (!slide.title || typeof slide.title !== 'string') {
            return {
              success: false,
              error: `Slide ${i + 1}: title is required and must be a string`,
            };
          }
        }

        const currentState = getPresentationState();
        const updatedAt = new Date().toISOString();
        
        setPresentationState({
          slides: params.slides,
          metadata: {
            createdAt: currentState.metadata.createdAt,
            updatedAt,
          },
        });

        return {
          success: true,
          message: `Successfully set ${params.slides.length} presentation slide(s)`,
          data: {
            approved: true,
            status: 'applied',
            slidesCount: params.slides.length,
            slides: params.slides,
            updatedAt,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to set presentation slides',
        };
      }
    },

    /**
     * Get presentation slides
     * Tool Name: get_presentation_slides
     * Description: Retrieves the current list of presentation slides with their images and titles. Use this to see what slides are currently configured in the presentation.
     * Input Schema:
     * {
     *   "type": "object",
     *   "properties": {}
     * }
     */
    get_presentation_slides: async (input: unknown): Promise<ToolResponse> => {
        try {
          void input;
          const currentState = getPresentationState();

          return {
            success: true,
            message: `Retrieved ${currentState.slides.length} presentation slide(s)`,
            data: {
              slidesCount: currentState.slides.length,
              slides: currentState.slides,
              metadata: currentState.metadata,
            },
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get presentation slides',
          };
        }
    },
  };
};

export { EMPTY_PRESENTATION };
