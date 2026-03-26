#!/usr/bin/env bash
#
until false; do
    prompt_dir=".claude/print"
    echo; echo; echo
    echo "Start new iteration: $(date)"; echo; echo
    for prompt_file in onetime.md custom.md forgewebui.md forgeapi.md forgedesign.md forgetests.md forgedocker.md; do
        prompt=$prompt_dir/$prompt_file
        if [ -e $prompt ]; then
            echo "Started working on $prompt at $(date)"; echo
            cat $prompt | .claude/resume -p "Execute the instructions in this prompt"
            echo "Stopped working on $prompt at $(date)"; echo; echo
            if [ "$prompt_file" == "onetime.md" ]; then
                # Remove one-time prompt action
                rm -f "$prompt" && \
                    echo "One-time action prompt \"$prompt\" was deleted"; echo
            fi
            sleep 30
        fi
    done
    echo "Building a container image"
    DOCKERFILE=$(find . -name "Dockerfile" -not -path "*/node_modules/*" | head -1)
    docker build -f "$DOCKERFILE" -t cogtrix-webui:latest .
    sleep 180
done
