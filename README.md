# Employee-Shift-Report

It was requested that a shift report be created for an internal Team to track daily tasks.

This scope oof the code was to:

1. Create a directory for LT storage. It should follow this scheme: Storage Folder → Year Folder (“YYYY” Format) → Month Folder (“MMMMMM” Format)

2. Using the on-submit trigger from the Form (As a script container) perform the following functions
A. Using the Risk Email Distro, check if a user is authorized to use the form
  i. delete the data, and send a failed email message to the CS and Product Distro indicating non-authorized use.
    ii. Retrieve form submission data and continue the script

B. Retrieve API data from Zendesk and process relevant data:

C. Compile all information into a google document and replace variables with relevant information
    i.The document will be attached to the successful email
      ii. The document will be stored named by the date (“MM/dd/YYYY” Format)
