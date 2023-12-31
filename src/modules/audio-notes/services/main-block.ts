export interface IBlock {
  object: "block";
  type: "paragraph";
  paragraph: {
    rich_text: [
      {
        type: "text";
        text: {
          content: string;
        };
      }
    ];
  };
}

interface IRequest {
  TITLE: string;
  DATABASE_ID: string;
  BLOCK_TRANSCRIPTION: IBlock[];
  BLOCK_SUMMARY: IBlock[];
  BLOCK_TIMESTAMP: IBlock[];
  BLOCK_SHOWNOTES?: IBlock[];
}

const mainBlockJson = (data: IRequest) => {
  const {
    TITLE,
    DATABASE_ID,
    BLOCK_TRANSCRIPTION,
    BLOCK_SUMMARY,
    BLOCK_TIMESTAMP,
    BLOCK_SHOWNOTES,
  } = data;

  const spreadBlocks = (blocks: IBlock[]) => {
    return blocks.map((block) => ({
      ...block,
    }));
  };

  const blocks = {
    parent: { database_id: `${DATABASE_ID}` },
    properties: {
      Title: {
        title: [
          {
            text: {
              content: `${TITLE}`,
            },
          },
        ],
      },
    },
    children: [
      {
        object: "block",
        type: "heading_3",
        heading_3: {
          rich_text: [{ type: "text", text: { content: "Title" } }],
        },
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              type: "text",
              text: {
                content: `${TITLE}`,
              },
            },
          ],
        },
      },
      {
        object: "block",
        type: "heading_3",
        heading_3: {
          rich_text: [{ type: "text", text: { content: "Transcription" } }],
        },
      },
      ...spreadBlocks(BLOCK_TRANSCRIPTION),
      {
        object: "block",
        type: "heading_3",
        heading_3: {
          rich_text: [{ type: "text", text: { content: "Summary" } }],
        },
      },
      ...spreadBlocks(BLOCK_SUMMARY),
      {
        object: "block",
        type: "heading_3",
        heading_3: {
          rich_text: [
            { type: "text", text: { content: "Speaker Distinction" } },
          ],
        },
      },
      ...spreadBlocks(BLOCK_TIMESTAMP),
    ],
  };

  if (BLOCK_SHOWNOTES) {
    blocks.children.push(
      {
        object: "block",
        type: "heading_3",
        heading_3: {
          rich_text: [{ type: "text", text: { content: "Shownotes" } }],
        },
      },
      ...spreadBlocks(BLOCK_SHOWNOTES)
    );
  }

  return blocks;
};

export default mainBlockJson;
