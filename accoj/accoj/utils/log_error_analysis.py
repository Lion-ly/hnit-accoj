import sys
from os import path


def print_log_error(log_file_path: str, log_error_path: str = ""):
    """
    打印日志错误

    :param log_file_path: log file path
    :param log_error_path: log error path
    :return:
    """
    if not path.exists(log_file_path):
        print("Error: Log file path not Exist.\tPlease make sure the path correct!")
        sys.exit()
    error_code = set([i for i in range(400, 427)] + [428, 429, 431, 451] + [i for i in range(500, 512)])
    errors = ""
    with open(log_file_path) as log_file:
        log_lines = log_file.readlines()
        lines = len(log_lines)
        f = False
        for i in range(0, lines):
            try:
                status_code = int(log_lines[i].split(' ')[-3])
                if status_code in error_code:
                    f = True
                    error = f"{status_code} Error in line {i + 1}: \t{log_lines[i]}"
                    errors += error + "\n"
                    print(error, end='')
            except IndexError as e:
                pass
            except ValueError as e:
                pass
        if not f:
            print(f"No Error in \"{log_file_path}\"")
    if log_error_path:
        with open(log_error_path, 'a') as f:
            f.write(errors)


if __name__ == '__main__':
    flag = False
    for j, arg in enumerate(sys.argv):
        if arg == '-f' and j + 1 < len(sys.argv):
            print_log_error(sys.argv[j + 1])
            flag = True
            break
    if not flag:
        print('Please use `python log_error_analysis.py -f "log_file_path"` command.')
