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
readonly FN_ASSIGN="ASSIGN"

# Varaible vailidity.
readonly VALID_VAR='^[a-zA-Z_][a-zA-Z0-9_]*$'

#
# Helper functions.
#

# to_lowercase will convert a string to lowercase.
# If the input is empty, it will return an empty string.
# Example: to_lowercase "Hello World" will return "hello world".
to_lowercase() {
  local input="$1"
  if [[ -z "$input" ]]; then
    echo ""
  else
    echo "$input" | tr '[:upper:]' '[:lower:]'
  fi
}

# debug will print debug messages if flag is defined.
debug() {
  if [[ -n "$BE_DEBUG" ]]; then
    echo "DEBUG: $1" >&2
  fi
}

#
# Built-in template functions.
#

# be_variable simply outputs the variable.
# It supports pipes to functions with arguments.
# Example: {{VAR|UPPERCASE|TRIM left|REPLACE "-" "_"|REPLACE "\"" "'"}}
be_variable() {
  local var="$1"
  local fn=""
  local tmp=""
  local parts=()
  local args=()
  local fn_args=()
  local fn_and_args=""

  IFS="$TOKEN_PIPE" read -ra parts <<< "$1"
  for i in "${!parts[@]}"; do 
    if [[ $i -eq 0 ]]; then
      # Variable name.
      var="${parts[$i]}"
    elif [[ $i -lt 3 ]]; then
      # Function name and args.
      fn_and_args="${parts[$i]}"
      # Utilize eval to handle quoting in args.
      eval "read -ra fn_args <<< \"$fn_and_args\""
      fn="${fn_args[0]}"
      for arg in "${fn_args[@]:1}"; do
        if [[ "$arg" =~ $VALID_VAR && -n "${!arg}" ]]; then
          # Valid variable, append its value to args.
          args+=("${!arg}")
        else
          # Invalid variable, append the argument as-is.
          args+=("$arg")
        fi
      done

      fn="$(to_lowercase "$fn")"
      if ! type "be_$fn" &>/dev/null; then
        debug "FN=be_$fn;ERROR=Not found"
        # Function does not exist, return the variable as-is and skip.
        tmp="${!var}"
        continue
      else
        # Function exists, run it with the variable and arguments.
        debug "FN=be_$fn;VAR=$var;ARGS=${args[*]}"
        if [[ -z "$tmp" ]]; then
          # No previous value, run the function on the variable.
          tmp=$(echo "${!var}" | be_"$fn" "${args[@]}")
        else
          # Previous value exists, run the function on it.
          tmp=$(echo "$tmp" | be_"$fn" "${args[@]}")
        fi
      fi
    fi
  done

  if [[ -z "$fn" ]]; then
    # No pipe method detected, just return the variable.
    if [[ "$var" =~ $VALID_VAR && -n "$var" ]]; then
      # Valid variable, return its value.
      debug "VAR=$var;VALUE=${!var}"
      echo "${!var}"
    else
      # Invalid variable, return as-is.
      debug "VAR=$var;VALUE=${var}"
      echo "$var"
    fi
  else
    # Pipe method detected, return what was processed.
    echo "$tmp"
  fi
}

# be_include handles including a partial in a template.
# It is ran through be.
# Example: {{>templates/_partial.html}}
be_include() {
  debug "INCLUDE=$1"
  be < "$1"
}

# be_if handles checking if a variable is truthy.
# If so, the block contents will be displayed.
# If not, the block will be removed.
# Block contents is ran through be.
# Example: {{#HANDLE}}We have a handle, its {{HANDLE}}!{{/HANDLE}}
be_if() {
  local block=""
  local value="${!1}"

  block=$(cat -)
  if [[ -n "$value" ]]; then
    # Passed, return parsed version of block.
    echo "$block" | be
  else
    # Failed, return nothing.
    echo ""
  fi
}

# be_unless handles checking if a variable is empty or not defined.
# If so, the block will be removed.
# If not, the block contents will be displayed.
# Block contents is ran through be.
# Example: {{^HANDLE}}We do not have a handle!{{/HANDLE}}
be_unless() {
  local block=""
  local value="${!1}"

  block=$(cat -)
  if [[ -z "$value" ]]; then
    # Passed, return parsed version of block.
    echo "$block" | be
  else
    # Failed, return nothing.
    echo ""
  fi
}

# be_function will run a custom function.
# If arguments exist, they will be passed to the custom function.
# Block content will be piped to the function.
# Example: {{@FUNCTION_NAME arg1 arg2 arg3}}...{{/FUNCTION_NAME arg1 arg2 arg3}}
be_function() {
  local fn=""
  local block=""
  local args=()
  local fn_args=()

  # Build out the list of arguments, if any.
  block=$(cat -)
  eval "read -ra fn_args <<< \"$1\""
  fn="${fn_args[0]}"
  for arg in "${fn_args[@]:1}"; do
    if [[ "$arg" =~ $VALID_VAR ]]; then
      local value="${!arg}"
      if [[ -n "$value" ]]; then
        args+=("$value")
      else
        args+=("$arg")
      fi
    else
      args+=("$arg")
    fi
  done

  fn=$(to_lowercase "$fn")
  if ! type "be_$fn" &>/dev/null; then
    # Function does not exist, return the block as-is.
    debug "FN=be_$fn;ERROR=Not found"
    echo "$block"
  else
    # Function exists, run it with the block and args.
    debug "FN=be_$fn;ARGS=${args[*]}"
    echo "$block" | be_"$fn" "${args[@]}"
  fi
}

# be_foreach will loop block contents with provided variable and optional delimiter.
# {{VALUE}},{{KEY}},{{KEY0}},{{KEY1}} are special inside the block contents, it will be replaced
# respectively with the value and key of the object.
# Example: {{@FOREACH VAR DEL}}{{KEY}}:{{VALUE}}{{^LAST}}, {{/LAST}}{{/FOREACH VAR DEL}}
be_foreach() {
  local vals
  local parsed=""
  local tmp=""
  local value=""
  local block=""
  block=$(cat -)

  if [[ -z "$2" ]]; then
    # No delimiter passed in.
    vals="$1"
  else
    # Delimiter passed in.
    if [[ "$1" =~ $VALID_VAR && -n "$1" ]]; then
      # Valid variable, read it as an array.
      readarray -d "$2" -t vals <<< "$1"
    else
      # Invalid variable, just split the string.
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
    VALUE=${vals[$key]}
    KEY="$key"
    KEY0="$key"
    KEY1=$((key + 1))
    LAST=""
    FIRST=""

    # First index handling.
    if [[ "$key" -eq 0 ]]; then
      FIRST="true"
    fi

    # Last index handling.
    li=$(( ${#vals[@]} - 1 ))
    if [[ "$key" -eq "$li" ]]; then
      LAST="true"
    fi

    parsed="${parsed}$(echo "$block" | be)"
  done

  echo "$parsed"
}

# be_raw will output the block content as-is, without any processing.
# Example: {{@RAW}}I wont be processed {{AT}} {{ALL}}{{/RAW}}
be_raw() {
  local block=""
  block=$(cat -)
  echo "$block"
}

# be_append will append the input to the end of the string.
# Example: {{VAR|APPEND e|APPEND x}}
be_append() {
  local input
  input=$(cat -)
  echo "$input$1"
}

# be_assign will assign the input to a global variable.
# Example: {{@ASSIGN VAR}}value{{/ASSIGN VAR}}
be_assign() {
  local var="$1"
  local value
  value=$(cat -)
  declare -g "$var=$value"
}
#
# Main function.
#

# be will parse the template and replace variables or run operations.
# Variables:
#   {{HANDLE}}
#   {{HANDLE|UPPERCASE}}
#   {{HANDLE|UPPERCASE|TRIM left|REPLACE "-" "_"|REPLACE "\"" "'"}}
# If:
#   {{#HANDLE}}We have a handle, its {{HANDLE}}!{{/HANDLE}}
# Unless:
#   {{^HANDLE}}We do not have a handle!{{/HANDLE}}
# Partials:
#   {{>templates/_partial.html}}
# Functions:
#   {{@FOREACH VAR DEL}}{{KEY}}:{{VALUE}}{{^LAST}}, {{/LAST}}{{/FOREACH VAR DEL}}
#   {{@RAW}}I wont be processed {{AT}} {{ALL}}{{/RAW}}
# Assignments:
#   {{@ASSIGN VAR}}value{{/ASSIGN VAR}}
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
  local char="" # Current character.
  local peek="" # Peeked characters.
  local len=0 # Length of the input string.
  local input="" # Input string to process.
  local result="" # Parsed content.
  input=$(cat -)
  result="$input"
  len=${#input}

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
      while (( idx < len )); do
        char=${input:$idx:1}
        if [[ "$(seek -1)" == "$TOKEN_CLOSE_BRACE" && "$char" == "$TOKEN_CLOSE_BRACE" ]]; then
          # End of expression or block, skip past the closing brace and break out.
          ((idx+=2))
          break
        elif [[ "$char" != "$TOKEN_CLOSE_BRACE" ]]; then
          # Not a brace, capture the character.
          expr="${expr}${char}"
        fi
        # Move to the next character.
        ((idx++))
      done

      # Process the expression, if it is a block.
      block=""
      if [[ "$expr" == ["$TOKEN_BLOCK_OPS"]* ]]; then
        # Keep going until we find the closing tag.
        local expr_name="${expr:1}"
        local closing_tag="{{$TOKEN_CLOSE_SLASH$expr_name}}"
        local closing_len=${#closing_tag}
        while (( idx < len )); do
          char=${input:$idx:1}
          if [[ "$(seek "$closing_len")" == "$closing_tag" ]]; then
            block_end=$((idx + closing_len))
            ((idx+=closing_len))
            break
          else
            block+="$char"
            ((idx++))
          fi
        done
      fi

      # Check if we have an operation or block.
      if [[ "$block" != "" ]]; then
        # Process by operation.
        local match="${input:$block_start:(block_end - block_start)}"
        case "${expr:0:1}" in
          # Handle if.
          "$TOKEN_OP_IF")
            debug "OP=$expr"
            parsed=$(echo "$block" | be_if "${expr:1}")
            result="${result/"$match"/"$parsed"}"
            ;;

          # Handle unless.
          "$TOKEN_OP_UNLESS")
            debug "OP=$expr"
            parsed=$(echo "$block" | be_unless "${expr:1}")
            result="${result/"$match"/"$parsed"}"
            ;;

          # Handle functions.
          "$TOKEN_OP_FUNCTION")
            debug "OP=$expr"
            if [[ "${expr:1}" == "$FN_ASSIGN "* ]]; then
              # Special handling for assign so global variables can be set.
              be_assign "${expr:8}" <<< "$(echo "$block" | be)"
              result="${result/"$match"/""}"
            else
              # Handle custom function.
              # Remove the @ and run the function.
              parsed=$(echo "$block" | be_function "${expr:1}")
              result="${result/"$match"/"$parsed"}"
            fi
            ;;

          # Unknown, skip.
          *)
            debug "OP=$expr;ERROR=Unknown operation"
            ;;
        esac
      else
        local match="$TOKEN_OPEN_BRACE$TOKEN_OPEN_BRACE$expr$TOKEN_CLOSE_BRACE$TOKEN_CLOSE_BRACE"
        case "${expr:0:1}" in
          # Handle include of partial.
          "$TOKEN_OP_INCLUDE")
            debug "OP=$expr"
            parsed=$(be_include "${expr:1}")
            result="${result/"$match"/"$parsed"}"
            ;;

          # Handle variable.
          *)
            debug "VAR=$expr"
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
