import React, { useState } from "react";
import "./App.css";

// Define types for our data structures
type Student = string[]; // [Timestamp, Email, LastName, FirstName, Grade, Choice1, Choice2, Choice3]
/*
type Club = {
  name: string;
  capacity: number;
}; */
type ClubMap = Map<string, number>; // Map<ClubName, Capacity>
type ClubAssignments = {
  [clubName: string]: Student[];
};
type ClubVotes = {
  [clubName: string]: number;
};

function App() {
  // State for club data, student data, and final assignments
  const [clubs, setClubs] = useState<ClubMap | null>(null);
  const [students, setStudents] = useState<Student[] | null>(null);
  const [clubAssignments, setClubAssignments] =
    useState<ClubAssignments | null>(null);

  // Handler for the clubs CSV file
  const handleClubsFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const text = e.target?.result as string;
      if (text) {
        const clubMap: ClubMap = new Map();
        const lines = text.trim().split("\n");
        lines.forEach((line) => {
          const [name, capacityStr] = line.split(",");
          const capacity = parseInt(capacityStr?.trim(), 10);
          if (name && !isNaN(capacity)) {
            clubMap.set(name.trim(), capacity);
          }
        });
        setClubs(clubMap);
      }
    };
    reader.readAsText(file);
  };

  // Handler for the student votes CSV file
  const handleStudentsFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const text = e.target?.result as string;
      if (text) {
        const studentList: Student[] = text
          .trim()
          .split("\n")
          .map((line) => line.split(","));
        setStudents(studentList);
      }
    };
    reader.readAsText(file);
  };

  // Main logic to process and assign students to clubs
  const processAndAssignClubs = () => {
    if (!students || !clubs) {
      alert("Please upload both clubs and student votes files.");
      return;
    }

    const clubVotes: ClubVotes = {};
    const clubList = Array.from(clubs.keys());

    // Count votes for each club
    students.forEach((student) => {
      for (let i = 5; i <= 7; i++) {
        // Choices are in indices 5, 6, and 7
        const choice = student[i]?.trim();
        if (choice && clubs.has(choice)) {
          // Only count votes for valid clubs
          clubVotes[choice] = (clubVotes[choice] || 0) + 1;
        }
      }
    });

    // Sort clubs by popularity (least to most)
    const sortedClubs = clubList
      .slice()
      .sort((a, b) => (clubVotes[a] || 0) - (clubVotes[b] || 0));

    const assignments: ClubAssignments = {};
    let remainingStudents: Student[] = [...students];

    sortedClubs.forEach((clubName) => {
      assignments[clubName] = [];
      const maxStudents = clubs.get(clubName) || 0;
      let studentsFound = 0;

      // Iterate through 1st, 2nd, and 3rd choices
      for (let choiceIndex = 5; choiceIndex <= 7; choiceIndex++) {
        let studentIndex = 0;
        while (
          studentIndex < remainingStudents.length &&
          studentsFound < maxStudents
        ) {
          if (
            remainingStudents[studentIndex][choiceIndex]?.trim() === clubName
          ) {
            assignments[clubName].push(remainingStudents[studentIndex]);
            remainingStudents.splice(studentIndex, 1);
            studentsFound++;
          } else {
            studentIndex++;
          }
        }
      }
    });

    assignments["Remainder"] = remainingStudents;
    setClubAssignments(assignments);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Club Sorter</h1>
        <p>Upload your club list and student votes to begin.</p>
        <div className="file-inputs">
          <div>
            <label htmlFor="clubs-file">
              1. Upload Clubs CSV, expected format:
              <br />
              ClubName, Capacity
            </label>
            <br />
            <input
              id="clubs-file"
              type="file"
              accept=".csv"
              onChange={handleClubsFileChange}
            />
          </div>
          <br />
          <br />
          <div>
            <label htmlFor="students-file">
              2. Upload Student Votes CSV, expected format:
              <br />
              Timestamp, Email, LastName, FirstName, Grade, Choice1, Choice2,
              Choice3
            </label>
            <br />
            <input
              id="students-file"
              type="file"
              accept=".csv"
              onChange={handleStudentsFileChange}
            />
          </div>
        </div>
        <br />
        <br />
        <button onClick={processAndAssignClubs} disabled={!clubs || !students}>
          Assign Students
        </button>
      </header>
      <main>
        {clubAssignments && (
          <div className="results">
            <h2>Club Assignments</h2>
            {Object.entries(clubAssignments).map(([club, assignedStudents]) => (
              <div key={club} className="club-card">
                <h3>
                  {club} ({assignedStudents.length} /{" "}
                  {clubs?.get(club) || "N/A"})
                </h3>
                <ul>
                  {assignedStudents.map((student, index) => (
                    // student[2] is LastName, student[3] is FirstName, student[4] is Grade
                    <li
                      key={index}
                    >{`${student[3]} ${student[2]} - Grade ${student[4]}`}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
