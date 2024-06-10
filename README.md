# UofT Timetable Tracker

This is a frontend webpage used to visualize captures of all of
UofT's Fall-Winter 2022-2023 course enrollments over time.

VIEW THE SITE HERE: https://icprplshelp.github.io/UofT-Enrollment-Tracker/

Screenshot:

![image](https://user-images.githubusercontent.com/93059453/182308380-776ba918-c2e1-4f9a-9cdf-e5b13564197a.png)

## Notes

This site does not update in realtime. The intention of this repository is to display enrollment data and contains no functionality
that captures enrollment data.

## Self-hosting

In `src/app/crsgetter.service.ts`, set `crsPath` to be the lead URL to where all
the timing information can be found. It must have a trailing slash.

For example: `${this.crsPath}20249/CSC110Y1F.json` should link to that corresponding file.
