#!/bin/bash

# Tokens.
readonly TOKEN_OPEN_BRACE="{"
readonly TOKEN_CLOSE_BRACE="}"
readonly TOKEN_CLOSE_SLASH="/"
readonly TOKEN_OP_UNLESS="^"
readonly TOKEN_OP_IF="#"
readonly TOKEN_OP_INCLUDE=">"
readonly TOKEN_OP_FUNCTION="@"
readonly TOKEN_BLOCK_OPS="${TOKEN_OP_IF}${TOKEN_OP_FUNCTION}${TOKEN_OP_UNLESS}"
readonly TOKEN_PIPE="|"

# Varaible vailidity.
readonly VALID_VAR='^[a-zA-Z_][a-zA-Z0-9_]*$'

#
# Helper functions.
#

# to_lowercase will convert a string to lowercase.
to_lowercase() {
  local input="$1"
  if [[ -z "$input" ]]; then
    echo ""
  else
    echo "$input" | tr '[:upper:]' '[:lower:]'
  fi
}

#
# Built-in template functions.
#

# be_variable simply outputs the variable.
be_variable() {
  local var="$1"
  local fn=""
  local tmp=""
  declare -a args

  IFS="$TOKEN_PIPE" read -ra parts <<< "$1"
  for i in "${!parts[@]}"; do 
    if [[ $i -eq 0 ]]; then
      # Variable name.
      var="${parts[$i]}"
    elif [[ $i -gt 0 ]]; then
      # Function name.
      fn="${parts[$i]}"
      # Process arguments, if any.
      read -ra sparts <<< "$fn"
      for x in "${!sparts[@]}"; do
        if [[ $x -eq 0 ]]; then
          # Fix function name.
          fn="${sparts[$x]}"
        else
          if [[ "${sparts[$x]}" =~ $VALID_VAR ]]; then
            local value="${!sparts[$x]}"
            if [[ -n "$value" ]]; then
              args+=("$value")
            else
              args+=("${sparts[$x]}")
            fi
          else
            # Not a valid variable, just add it as-is.
            args+=("${sparts[$x]}")
          fi
        fi
      done

      fn="$(to_lowercase "$fn")"
      if ! type "be_$fn" &>/dev/null; then
        # Function does not exist, return the variable as-is.
        tmp="${!var}"
        break
      else
        # Function exists, run it with the variable and arguments.
        if [[ -z "$tmp" ]]; then
          tmp=$(echo "${!var}" | be_"$fn" "${args[@]}")
        else
          tmp=$(echo "$tmp" | be_"$fn" "${args[@]}")
        fi
      fi
    fi
  done

  if [[ -z "$fn" ]]; then
    # No pipe method detected, just return the variable.
    if [[ "$var" =~ $VALID_VAR ]]; then
      echo "${!var}"
    else
      # Not a valid variable, return as-is.
      echo "$var"
    fi
  else
    # Return the processed piped variable.
    echo "$tmp"
  fi
}

# be_include handles including a partial in a template.
# It is ran through be.
be_include() {
  local contents=""
  contents="$(cat "$1")"
  echo "$contents" | be
}

# be_if handles checking if a variable is truthy.
# If so, the block contents will be displayed.
# If not, the block will be removed.
# Block contents is ran through be.
be_if() {
  local block=""
  local value=""

  block=$(cat -)
  value="${!1}"
  if [[ -n "$value" ]]; then
    # Passed, return parsed version of block.
    local parsed
    parsed=$(echo "$block" | be)
    echo "$parsed"
  else
    # Failed, return nothing.
    echo ""
  fi
}

# be_unless handles checking if a variable is empty or not defined.
# If so, the block will be removed.
# If not, the block contents will be displayed.
# Block contents is ran through be.
be_unless() {
  local block=""
  local value=""

  block=$(cat -)
  value="${!1}"
  if [[ -z "$value" ]]; then
    # Passed, return parsed version of block.
    local parsed
    parsed=$(echo "$block" | be)
    echo "$parsed"
  else
    # Failed, return nothing.
    echo ""
  fi
}

# be_function will run a custom function.
# If arguments exist, they will be passed to the custom function.
# Block content will be piped to the function.
be_function() {
  local fn=""
  local block=""
  local index=0
  declare -a args

  # Build out the list of arguments, if any.
  block=$(cat -)
  for part in $1; do
    if [[ $index -eq 0 ]]; then
      fn=$part
    else
      if [[ "${sparts[$x]}" =~ $VALID_VAR ]]; then
        local value="${!part}"
        if [[ -n "$value" ]]; then
          args+=("$value")
        else
          args+=("$part")
        fi
      else
        # Not a valid variable, just add it as-is.
        args+=("$part")
      fi
    fi

    ((index++))
  done

  fn=$(to_lowercase "$fn")
  if ! type "be_$fn" &>/dev/null; then
    # Function does not exist, return the block as-is.
    echo "$block"
  else
    echo "$block" | be_"$fn" "${args[@]}"
  fi
}

# be_foreach will loop block contents with provided variable and optional delimiter.
# {{VALUE}} and {{KEY}} are special inside the block contents, it will be replaced
# respectively with the value and key of the object.
be_foreach() {
  local vals
  local parsed=""
  local tmp=""
  local value=""
  local block=""
  block=$(cat -)

  if [[ -z "$2" ]]; then
    # No delimiter passed in.
    vals="${!1}"
  else
    # Delimiter passed in.
    if [[ "$1" =~ $VALID_VAR ]]; then
      # Valid variable, read it as an array.
      readarray -d "$2" -t vals <<< "${!1}"
    else
      # Not a valid variable, just split the string.
      IFS="$2" read -ra vals <<< "$1"
    fi
  fi

  # Inital loop values.
  FIRST=""
  LAST=""
  KEY=""
  KEY0=""
  KEY1=""
  VALUE=""
  for key in "${!vals[@]}"; do
    KEY="$key"
    KEY0="$key"
    KEY1=$((key + 1))
    VALUE=${vals[$key]}

    # First index handling.
    if [[ "$key" -eq 0 ]]; then
      FIRST="true"
    else
      unset FIRST
    fi

    # Last index handling.
    li=$(( ${#vals[@]} - 1 ))
    if [[ "$key" -eq "$li" ]]; then
      LAST="true"
    else
      unset LAST
    fi

    parsed="${parsed}$(echo "$block" | be)"
  done
  # Reset loop values.
  unset FIRST
  unset LAST
  unset KEY
  unset KEY0
  unset KEY1
  unset VALUE

  echo "$parsed"
}

# be_raw will output the block content as-is, without any processing.
be_raw() {
  local block=""
  block=$(cat -)
  echo "$block"
}

#
# Main function.
#

# be will parse the template and replace variables or run operations.
# Variables:
#   {{HANDLE}}
#   {{HANDLE|UPPERCASE}}
#   {{HANDLE|UPPERCASE|TRIM left|REPLACE - _}}
# If:
#   {{#HANDLE}}We have a handle, its {{HANDLE}}!{{/HANDLE}}
# Unless:
#   {{^HANDLE}}We do not have a handle!{{/HANDLE}}
# Partials:
#   {{>templates/_partial.html}}
# Functions:
#   {{@FOREACH VAR DEL}}{{KEY}}:{{VALUE}}{{^LAST}}, {{/LAST}}{{/FOREACH VAR DEL}}
#   {{@RAW}}I wont be processed {{AT}} {{ALL}}{{/RAW}}
# Custom functions:
#   {{@FUNCTION_NAME arg1 arg2 arg3}}...{{/FUNCTION_NAME arg1 arg2 arg3}}
# Etc...
#
# Goal was to stick close to Mustache features and a high-level.
# Nesting is supported as well.
# This works by finding all matches of the template syntax, then
# going through each match one by one.
# With each match, each character is inspected one by one.
# By going through each character and positions, the applicable
# template action is determined and then processed.
be() {
  local idx=0 # Current index in the input string.
  local expr="" # Current expression being processed.
  local block="" # Current block content being processed.
  local block_start=0 # Start index of the block.
  local block_end=0 # End index of the block.
  local cc="" # Current character.
  local peek="" # Peeked characters.
  local len=0 # Length of the input string.
  local input="" # Input string to process.
  local result="" # Parsed content.
  input=$(cat -)
  result="$input"
  len=${#input}

  # char will return the character at the current index.
  char() {
    echo "${input:$idx:1}"
  }

  # seek will return the next n characters from the current index.
  # If n is positive, it returns the next n characters.
  # If n is negative, it returns the character at the current index minus n.
  # If it is out of bounds, it returns an empty string.
  seek() {
    local len=${#input}
    local pos=0
    local n="$1"
    if (( n > 0 )); then
      pos=$idx
      if (( pos + n > len )); then
        echo ""
      else
        echo "${input:$pos:$n}"
      fi
    elif (( n < 0 )); then
      pos=$((idx - n))
      if (( pos < 0 )); then
        echo ""
      else
        echo "${input:$pos:1}"
      fi
    else
      echo ""
    fi
  }

  while (( idx < len )); do
    # Peek the next two characters to see if we have a template expression.
    peek=$(seek 2)
    if [[ "$peek" == "$TOKEN_OPEN_BRACE$TOKEN_OPEN_BRACE" ]]; then
      # Template expression found. Skip the opening braces.
      block_start=$idx
      ((idx+=2))

      # Capture the expression.
      expr=""
      while true; do
        cc=$(char)
        if [[ "$(seek -1)" == "$TOKEN_CLOSE_BRACE" && "$cc" == "$TOKEN_CLOSE_BRACE" ]]; then
          # End of expression or block, skip past the closing brace and break out.
          ((idx+=2))
          break
        elif [[ "$cc" != "$TOKEN_CLOSE_BRACE" ]]; then
          # Not a brace, capture the character.
          expr="${expr}${cc}"
        fi
        # Move to the next character.
        ((idx++))
      done

      # Process the expression, if it is a block.
      block=""
      if [[ "$expr" == ["$TOKEN_BLOCK_OPS"]* ]]; then
        local expr_name="${expr:1}"
        local expr_len=${#expr_name}
        expr_len=$((expr_len + 5)) # Skip the closing braces and the operator when seeking.
        while true; do
          if [[ "$(seek $expr_len)" == "{{/$expr_name}}" ]]; then
            # End of block. Skip to the end of the block.
            block_end=$((idx + expr_len))
            ((idx+=expr_len))
            break
          else
            # Not the end of the block, capture the character.
            block+="$(char)"
          fi
          # Move to the next character.
          ((idx++))
        done
      fi

      # Check if we have an operation or block.
      if [[ "$block" != "" ]]; then
        # Process by operation.
        local match="${input:$block_start:(block_end - block_start)}"
        case "${expr:0:1}" in
          # Handle if.
          "$TOKEN_OP_IF")
            parsed=$(echo "$block" | be_if "${expr:1}")
            result="${result/"$match"/"$parsed"}"
            ;;

          # Handle unless.
          "$TOKEN_OP_UNLESS")
            parsed=$(echo "$block" | be_unless "${expr:1}")
            result="${result/"$match"/"$parsed"}"
            ;;

          # Handle functions.
          "$TOKEN_OP_FUNCTION")
            parsed=$(echo "$block" | be_function "${expr:1}")
            result="${result/"$match"/"$parsed"}"
            ;;

          # Unknown, skip.
          *)
            ;;
        esac
      else
        local match="$TOKEN_OPEN_BRACE$TOKEN_OPEN_BRACE$expr$TOKEN_CLOSE_BRACE$TOKEN_CLOSE_BRACE"
        case "${expr:0:1}" in
          # Handle include of partial.
          "$TOKEN_OP_INCLUDE")
            parsed=$(be_include "${expr:1}")
            result="${result/"$match"/"$parsed"}"
            ;;
          
          # Handle variable.
          *)
            parsed=$(be_variable "$expr")
            result="${result/"$match"/"$parsed"}"
            ;;
        esac
      fi
      continue
    fi
    # Skip to the next character.
    ((idx++))
  done

  echo "$result"
}
