#!/bin/bash

# Check if input file is provided
if [ $# -ne 1 ]; then
    echo "Usage: $0 <input_file>"
    exit 1
fi

# Input file
input_file="$1"

# Check if input file exists
if [ ! -f "$input_file" ]; then
    echo "Error: Input file '$input_file' not found!"
    exit 1
fi

# Create output directory if it doesn't exist
output_dir="../public/assets/logos/faction"
mkdir -p "$output_dir"

# Read faction names and URLs from file line by line
# Format: faction_name:url
while IFS=':' read -r faction_name url; do
    # Skip empty lines and comments
    if [ -z "$faction_name" ] || [[ "$faction_name" == \#* ]]; then
        continue
    fi

    # Trim whitespace
    faction_name=$(echo "$faction_name" | xargs)
    url=$(echo "$url" | xargs)

    # Create filename from faction name
    filename="${faction_name}.svg"

    echo "Downloading: $url"

    # Download SVG using curl
    curl -s "$url" > "$output_dir/$filename"

    # Check if download was successful
    if [ $? -eq 0 ]; then
        echo "Successfully downloaded: $filename"
    else
        echo "Failed to download: $url"
    fi

done < "$input_file"

echo "Download complete! SVGs are saved in $output_dir/"
