import { Note } from "../models/note.model.js";

// Get all notes
export const getAllNotes = async (req, res) => {
    const userId = req.userId;
    try {
        const notes = await Note.find({
            userId
        }).sort({ isPinned: -1});
        return res.status(200).json({
            status: "success",
            notes,
            message: "All notes retrieved successfully."
        });
    } catch (error) {
        console.log
        return res.status(400).json({
            status: "failed", 
            message: "Failed to fetch notes." 
        });
    }
};

// Add a note 
export const addNote = async (req, res) => {
    //get title, content, tags, and userId
    const { title, content, tags } = req.body;
    const userId = req.userId;
    try {
        if (!title) {
            return res.status(400).json({
                status: "failed",
                message: "Title is required",
            });
        }
        if (!content) {
            return res.status(400).json({
                status: "failed",
                message: "Content is required",
            });
        }
        const newNote = new Note({
            userId,
            title,
            content,
            tags: tags || [],
        });
        await newNote.save(); // always save
        //display message
        return res.status(201).json({
            status: "success",
            message: "Note added successfully",
        });
    } catch (error) {
        console.log("Error adding new note ", error);
        return res.status(400).json({
            status: "failed",
            message: error.message,
        });
    }
}

// Edit note
export const editNote = async (req, res) => {
    //get title, content, tags, isPinned, userId, and noteId
    const noteId = req.params.noteId;
    const { title, content, tags, isPinned } = req.body;
    const userId = req.userId;

    try {
        //check if there are changes per note
        if (!title && !content && !tags) {
            return res.status(400).json({
                status: "failed",
                message: "No changes",
            });
        }
        //get note via id
        const note = await Note.findOne({
            _id: noteId,
            userId,
        })
        //if note not found
        if(!note) {
            return res.status(404).json({
                status: "failed",
                message: "Note not found."
            });
        }
        //how change works
        if(title) note.title = title;
        if(content) note.content = content;
        if(tags) note.tags = tags;
        if(isPinned) note.isPinned = isPinned;
        await note.save(); //always save
        //display message 
        return res.status(200).json({
            status: "success",
            message: "Note updated successfully."
        })
    } catch (error) {
        console.log("Error updating new note ", error);
        return res.status(400).json({
            status: "failed",
            message: error.message,
        });
    }
}

// Delete a note
export const deleteNote = async (req, res) => {
    const noteId = req.params.noteId;
    const userId = req.userId;
    try {
        //get the note via noteId
        const note = await Note.findOne({
            _id: noteId,
            userId
        })
        //if note not found
        if(!note) {
            return res.status(404).json({
                status: "failed",
                message: "Note not found."
            })
        }
        await Note.deleteOne({
            _id: noteId,
            userId
        });
        //display message
        return res.status(200).json({
            status: "success",
            note,
            message: "Note deleted successfully."
        });
    } catch (error) {
        console.log
        return res.status(400).json({
            status: "failed", 
            message: "Failed to fetch notes." 
        });
    }
};

export const isPinned = async (req, res) => {
  const noteId = req.params.noteId;
  const { isPinned } = req.body;
  const userId = req.userId;

  try {
    const note = await Note.findOne({ _id: noteId, userId });

    if (!note) {
      return res.status(404).json({
        status: "failed",
        message: "Note not found.",
      });
    }

    note.isPinned = isPinned;  // directly assign without if check
    await note.save();

    // fetch updated notes list
    const notes = await Note.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      status: "success",
      notes,  // <-- send updated notes here
    });
  } catch (error) {
    console.log("Error updating note pin status:", error);
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};
