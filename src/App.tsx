import React, { useState } from "react";
import "./App.css";

// Define types for our data structures
type Student = string[]; // [Timestamp, Email, LastName, FirstName, Grade, Choice1, Choice2, Choice3]
type ClubMap = Map<string, number>; // Map<ClubName, Capacity>
type ClubAssignments = {
  [clubName: string]: Student[];
};

function App() {
  // State for club data, student data, and final assignments
  const [clubs, setClubs] = useState<ClubMap | null>(null);
  const [students, setStudents] = useState<Student[] | null>(null);
  const [clubAssignments, setClubAssignments] = useState<ClubAssignments | null>(null);

  // Handler for the clubs CSV file
  const handleClubsFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const text = e.target?.result as string;
      if (text) {
        const clubMap: ClubMap = new Map();
        const lines = text.trim().split('\n');
        lines.forEach(line => {
          const [name, capacityStr] = line.split(',');
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
  const handleStudentsFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const text = e.target?.result as string;
      if (text) {
        const studentList: Student[] = text.trim().split('\n').map(line => line.split(','));
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

    // Initialize assignments map with empty arrays for each club
    const assignments: ClubAssignments = {};
    const clubList = Array.from(clubs.keys());
    clubList.forEach(clubName => {
      assignments[clubName] = [];
    });

    let unassignedStudents: Student[] = [...students];

    // Process assignments in three rounds (1st, 2nd, 3rd choice)
    for (let choiceIndex = 5; choiceIndex <= 7; choiceIndex++) {
      const studentsStillUnassigned: Student[] = [];
      
      unassignedStudents.forEach(student => {
        const choice = student[choiceIndex]?.trim();
        const clubCapacity = clubs.get(choice);
        
        // Check if the student's choice is a valid club and has space
        if (choice && assignments[choice] && clubCapacity !== undefined) {
          if (assignments[choice].length < clubCapacity) {
            // Assign student to the club
            assignments[choice].push(student);
          } else {
            // If the club is full, add the student to the list for the next round
            studentsStillUnassigned.push(student);
          }
        } else {
          // If the choice is invalid or not found in the club list, carry the student to the next round
          studentsStillUnassigned.push(student);
        }
      });
      
      // The students for the next round are the ones who couldn't be placed in this round
      unassignedStudents = studentsStillUnassigned;
    }

    // Any students left over are the remainder
    assignments['Remainder'] = unassignedStudents;
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
